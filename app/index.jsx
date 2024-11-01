import { Text, View, TextInput, Pressable, FlatList } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState, useEffect } from "react";
import { StyleSheet } from "react-native";
import AntDesign from '@expo/vector-icons/AntDesign';
import axios from "axios";

export default function Index() {
  const [todos, setTodos] = useState([]);
  const [text, setText] = useState('');

  useEffect(() => {
    const fetchTodos = async () => {
      try {
        const response = await axios.get("http://localhost:8000/todos");
        setTodos(response.data);
      } catch (error) {
        console.error("Error fetching todos:", error);
      }
    };
    fetchTodos();
  }, []);

  // Function to add a new todo
  const addTodo = async () => {
    if (text.trim()) {
      try {
        const response = await axios.post("http://localhost:8000/todos", {
          title: text,
          completed: false
        });
        if (response.status === 201) {
          const newTodo = response.data;
          setTodos([newTodo, ...todos]);
          setText('');
        } else {
          console.error("Failed to add todo");
        }
      } catch (error) {
        console.error("Error adding todo:", error);
      }
    }
  };

  // Function to toggle the 'completed' status of a todo
  const toggleTodo = async (id) => {
    const todo = todos.find((todo) => todo._id === id);
    if (!todo) return;

    try {
      const response = await axios.put(`http://localhost:8000/todos/${id}`, {
        completed: !todo.completed
      });

      if (response.status === 200) {
        const updatedTodo = response.data;
        setTodos(todos.map((todo) => (todo._id === id ? updatedTodo : todo)));
      }
    } catch (error) {
      console.error("Error updating todo:", error);
    }
  };

  // Function to delete a todo
  const removeTodo = async (id) => {
    try {
      const response = await axios.delete(`http://localhost:8000/todos/${id}`);
      if (response.status === 200) {
        setTodos(todos.filter((todo) => todo._id !== id));
      }
    } catch (error) {
      console.error("Error deleting todo:", error);
    }
  };

  // Render each item in the list
  const renderItem = ({ item }) => (
    <View style={styles.todoContainer}>
      <Text
        style={[styles.todoText, item.completed && styles.completedText]}
        onPress={() => toggleTodo(item._id)} // Toggle completion on press
      >
        {item.title}
      </Text>
      <Pressable onPress={() => removeTodo(item._id)}>
        <AntDesign name="delete" size={24} color="red" />
      </Pressable>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.inputContainer}>
        <TextInput 
          style={styles.input}
          placeholder="Add a new todo"
          placeholderTextColor="blue"
          value={text}
          onChangeText={setText} 
        />
        <Pressable onPress={addTodo} style={styles.addBtn}>
          <Text style={styles.addBtnText}>Add</Text>
        </Pressable>
      </View>
      <FlatList 
        data={todos}
        renderItem={renderItem}
        keyExtractor={(item) => item._id.toString()}
        contentContainerStyle={{ flexGrow: 1 }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, width: '100%' },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    padding: 10,
    width: '100%',
    maxWidth: '1024',
    marginHorizontal: 'auto',
  },
  input: {
    flex: 1,
    borderColor: 'blue',
    borderWidth: 1,
    borderRadius: 4,
    fontSize: 18,
    color: 'gray',
    padding: 5
  },
  addBtn: { backgroundColor: 'blue', borderRadius: 5, marginLeft: 5, padding: 5 },
  addBtnText: { color: 'white', fontSize: 18 },
  todoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  todoText: { fontSize: 18 },
  completedText: { color: 'red', textDecorationLine: 'line-through' },
});
