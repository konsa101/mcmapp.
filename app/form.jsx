import React, { useState, useEffect } from 'react';
import {
  View,
  Image,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  ScrollView,
  SafeAreaView,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import * as SQLite from 'expo-sqlite'; 

const db = SQLite.openDatabase('form_data.db'); 

export default function App() {
  const initialTasks = [
    { id: '1', system: 'Internet Services', services: [{ name: 'Services: External', state: 'click here to set', comment: '' }, { name: 'Services: Internal', state: 'click here to set state', comment: '' }] },
    { id: '2', system: 'Mufulira-Nkana Liquid Fibre Link', services: [{ name: 'Services: Connectivity', state: 'click here to set state', comment: '' }, { name: 'Services: Ping Response Range', state: 'click here to set state', comment: '' }] },
    { id: '3', item: '3', system: 'Mufulira-Nkana MTN Fibre Back Up Link', services: [{ name: 'Services: Connectivity', state: 'click here to set state', comment: '' }, { name: 'Services: Ping Response Range', state: 'click here to set state', comment: '' }] },
    { id: '4', item: '4', system: 'IT Board Room Codec', services: [{ name: 'Services: Connectivity & Testing', state: 'click here to set state', comment: '' }] },
    { id: '5', item: '5', system: 'Trust School', services: [{ name: 'Service: Connectivity', state: 'click here to set state', comment: '' }] },
    { id: '6', item: '6', system: 'VPN Connectivity', services: [{ name: 'Services: Connection Establishment', state: 'click here to set state', comment: '' }, { name: 'Services: LAN Accessibility', state: 'click here to set state', comment: '' }] },
    { id: '7', item: '7', system: 'B2B VPN', services: [{ name: 'Services: Connection Establishment', state: 'click here to set state', comment: '' }, { name: 'LAN Accessibility', state: 'click here to state', comment: '' }] },
    { id: '8', item: '8', system: 'Wireless Access Points Connectivity', services: [{ name: 'Services: Internal WLAN', state: 'click here to set state', comment: '' }, { name: 'Services: External Wireless', state: 'click here to set state', comment: '' }] },
    { id: '9', item: '9', system: 'Network SNMP Topology Monitoring', services: [{ name: 'Services: Wired LAN', state: 'click here to set state', comment: '' }, { name: 'Services: Wireless Radios LAN', state: 'click to set state', comment: '' }] },
    { id: '10', item: '10', system: 'Executives Residential Link', services: [{ name: 'Services: Internal', state: 'click here to set state', comment: '' }, {name: 'External', state: 'click here to set state'}] },
    { id: '11', item: '11', system: 'Multi Factor Authentication (MFA)', services: [{ name: 'Services: Connectivity', state: 'click here to set state', comment: '' }, {name: 'Services: Internal', state: 'click here to set state'}] },
    { id: '12', item: '12', system: 'Workspace/Mobile Phone e-mail', services: [{ name: 'Services: Send/Receive', state: 'click here to set state', comment: '' }] },
  ];

  const [tasks, setTasks] = useState(initialTasks);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    db.transaction((tx) => {
      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS form_data (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          task_id TEXT,
          system TEXT,
          service_name TEXT,
          state TEXT,
          comment TEXT
        );`,
        [],
        () => console.log('Table created successfully'),
        (tx, error) => console.error('Error creating table', error)
      );
    });
  }, []);

  const toggleState = (taskId, serviceName) => {
    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        task.id === taskId
          ? {
              ...task,
              services: task.services.map((service) =>
                service.name === serviceName
                  ? {
                      ...service,
                      state: service.state === 'OK' ? 'Not OK' : 'OK',
                      comment:
                        service.state === 'OK'
                          ? 'Connection Failure'
                          : 'Connected',
                    }
                  : service
              ),
            }
          : task
      )
    );
  };

  const handleSubmit = () => {
    // Validate that all comments are filled
    for (const task of tasks) {
      for (const service of task.services) {
        if (service.comment.trim() === '') {
          Alert.alert('Validation Error', 'Please fill out all comments before submitting.');
          return;
        }
      }
    }

    setIsSubmitting(true);

    db.transaction((tx) => {
      tasks.forEach((task) => {
        task.services.forEach((service) => {
          tx.executeSql(
            `INSERT INTO form_data (task_id, system, service_name, state, comment) VALUES (?, ?, ?, ?, ?);`,
            [task.id, task.system, service.name, service.state, service.comment],
            () => console.log('Data inserted successfully'),
            (tx, error) => console.error('Error inserting data', error)
          );
        });
      });

      Alert.alert('Success', 'Data saved locally.');
      setIsSubmitting(false);
    });
  };

  const fetchData = () => {
    db.transaction((tx) => {
      tx.executeSql(
        `SELECT * FROM form_data;`,
        [],
        (_, { rows: { _array } }) => {
          console.log('Fetched data:', _array);
          Alert.alert('Fetched Data', JSON.stringify(_array, null, 2));
        },
        (tx, error) => console.error('Error fetching data', error)
      );
    });
  };

  const renderTaskForm = (task) => (
    <View key={task.id} style={styles.formContainer}>
      <Text style={styles.formTitle}>{task.system}</Text>
      {task.services.map((service) => (
        <View key={service.name} style={styles.serviceRow}>
          <Text style={styles.label}>{service.name}</Text>
          <TouchableOpacity
            onPress={() => toggleState(task.id, service.name)}
            style={[
              styles.stateButton,
              { backgroundColor: service.state === 'Not OK' ? 'orange' : 'green' },
            ]}
          >
            <Text style={styles.stateText}>State: {service.state}</Text>
          </TouchableOpacity>
          <TextInput
            style={styles.inputCell}
            value={service.comment}
            onChangeText={(text) =>
              setTasks((prevTasks) =>
                prevTasks.map((t) =>
                  t.id === task.id
                    ? {
                        ...t,
                        services: t.services.map((s) =>
                          s.name === service.name ? { ...s, comment: text } : s
                        ),
                      }
                    : t
                )
              )
            }
            placeholder="Add comments here"
          />
        </View>
      ))}
    </View>
  );

  const filteredTasks = tasks.filter((task) =>
    task.system.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === "ios" ? "padding" : "height"}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.logoContainer}>
          <Image source={require('./assets/images/logo.PNG')} style={styles.image} resizeMode="contain" />
        </View>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>
            {'MOPANI COPPER MINES\nINFORMATION TECHNOLOGY\nFM-IT-046C\nNKANA DAILY NETWORK SYSTEM FORM'}
          </Text>
        </View>
        <TextInput
          style={styles.searchInput}
          placeholder="Search tasks..."
          value={searchTerm}
          onChangeText={setSearchTerm}
        />
        {filteredTasks.map(renderTaskForm)}

        <View style={styles.instructions}>
          <Text>For Items 2 And 3, ping responses above 10ms should call for investigations.</Text>
        </View>

        {isSubmitting ? (
          <ActivityIndicator size="large" color="green" style={{ marginVertical: 20 }} />
        ) : (
          <TouchableOpacity onPress={handleSubmit} style={styles.submitButton}>
            <Text style={styles.submitButtonText}>Save</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity onPress={fetchData} style={[styles.submitButton, { backgroundColor: 'blue' }]}>
          <Text style={styles.submitButtonText}>Fetch Saved Data</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollView: {
    flex: 1,
    padding: 20,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  image: {
    width: 250,
    height: 250,
    marginBottom: 20,
  },
  titleContainer: {
    marginBottom: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  searchInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 10,
    borderRadius: 5,
    marginBottom: 20,
  },
  formContainer: {
    marginBottom: 20,
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  formTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  serviceRow: {
    marginBottom: 15,
  },
  stateButton: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 3,
    marginBottom: 10,
    marginTop: 5,
  },
  stateText: {
    color: '#fff',
    fontSize: 14,
  },
  inputCell: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 10,
    fontSize: 14,
    borderRadius: 5,
    marginBottom: 10,
  },
  instructions: {
    marginBottom: 20,
    padding: 10,
    backgroundColor: '#e0e0e0',
  },
  submitButton: {
    backgroundColor: 'green',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    alignSelf: 'center',
    width: '50%',
    marginVertical: 20,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});