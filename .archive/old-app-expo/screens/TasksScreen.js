import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { useTheme } from '../hooks/useTheme';
import { useStorage } from '../hooks/useStorage';
import { useNotifications } from '../hooks/useNotifications';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import { colors } from '../constants/colors';
import { useTranslation } from 'react-i18next';
import SkeletonLoader from '../components/common/SkeletonLoader';

const TasksScreen = () => {
  const { t } = useTranslation();
  const { isDark } = useTheme();
  const { getItem, setItem } = useStorage();
  const { scheduleNotification } = useNotifications();
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState('');
  const [filter, setFilter] = useState('all'); // all, pending, completed
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      setIsLoading(true);
      const savedTasks = await getItem('tasks');
      if (savedTasks) {
        setTasks(JSON.parse(savedTasks));
      }
    } catch (error) {
      console.error('Error loading tasks:', error);
      setError('Failed to load tasks. Please check your connection.');
    } finally {
      setIsLoading(false);
    }
  };

  const saveTasks = async (updatedTasks) => {
    try {
      await setItem('tasks', JSON.stringify(updatedTasks));
      setTasks(updatedTasks);
    } catch (error) {
      console.error('Error saving tasks:', error);
    }
  };

  const addTask = async () => {
    if (!newTask.trim()) return;

    const task = {
      id: Date.now(),
      title: newTask.trim(),
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    const updatedTasks = [...tasks, task];
    await saveTasks(updatedTasks);
    setNewTask('');

    // Schedule notification for the new task
    await scheduleNotification({
      title: t('New Task Added'),
      body: task.title,
      date: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
    });
  };

  const updateTaskStatus = async (taskId, newStatus) => {
    const updatedTasks = tasks.map(task =>
      task.id === taskId ? { ...task, status: newStatus } : task
    );
    await saveTasks(updatedTasks);
  };

  const deleteTask = async (taskId) => {
    Alert.alert(
      t('Delete Task'),
      t('Are you sure you want to delete this task?'),
      [
        {
          text: t('Cancel'),
          style: 'cancel',
        },
        {
          text: t('Delete'),
          style: 'destructive',
          onPress: async () => {
            const updatedTasks = tasks.filter(task => task.id !== taskId);
            await saveTasks(updatedTasks);
          },
        },
      ]
    );
  };

  const filteredTasks = tasks.filter(task => {
    if (filter === 'all') return true;
    return task.status === filter;
  });

  const renderTaskItem = ({ item }) => (
    <Card style={styles.taskCard}>
      <View style={styles.taskHeader}>
        <TouchableOpacity
          style={[styles.statusButton, styles[`status_${item.status}`]]}
          onPress={() => updateTaskStatus(item.id, item.status === 'completed' ? 'pending' : 'completed')}
        >
          <Text style={styles.statusText}>{t(item.status)}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => deleteTask(item.id)}
        >
          <Text style={styles.deleteButtonText}>×</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.taskTitle}>{item.title}</Text>
      <Text style={styles.taskDate}>
        {new Date(item.createdAt).toLocaleDateString()}
      </Text>
    </Card>
  );

  const renderError = () => (
    <View style={styles.errorContainer}>
      <Text style={styles.errorText} accessibilityRole="alert">
        {error || 'Unable to load tasks. Please check your connection.'}
      </Text>
      <TouchableOpacity
        style={styles.retryButton}
        onPress={loadTasks}
        accessibilityRole="button"
        accessibilityLabel="Retry loading tasks"
      >
        <Text style={styles.retryButtonText}>Retry</Text>
      </TouchableOpacity>
    </View>
  );

  if (isLoading && filteredTasks.length === 0) {
    return (
      <View style={styles.container}>
        <SkeletonLoader rows={6} height={40} style={{ marginBottom: 12 }} />
      </View>
    );
  }

  if (error) {
    return renderError();
  }

  return (
    <View style={styles.container}>
      <View style={styles.filterContainer}>
        <Button
          title={t('All')}
          variant={filter === 'all' ? 'primary' : 'outline'}
          onPress={() => setFilter('all')}
          style={styles.filterButton}
        />
        <Button
          title={t('Pending')}
          variant={filter === 'pending' ? 'primary' : 'outline'}
          onPress={() => setFilter('pending')}
          style={styles.filterButton}
        />
        <Button
          title={t('Completed')}
          variant={filter === 'completed' ? 'primary' : 'outline'}
          onPress={() => setFilter('completed')}
          style={styles.filterButton}
        />
      </View>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={newTask}
          onChangeText={setNewTask}
          placeholder={t('Add a new task...')}
          placeholderTextColor={colors.gray}
        />
        <Button
          title={t('Add')}
          onPress={addTask}
          style={styles.addButton}
        />
      </View>

      <FlatList
        data={filteredTasks}
        renderItem={renderTaskItem}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={styles.listContainer}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 16,
  },
  filterContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  filterButton: {
    flex: 1,
    marginHorizontal: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  input: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    marginRight: 8,
    color: colors.text,
  },
  addButton: {
    width: 80,
  },
  listContainer: {
    paddingBottom: 16,
  },
  taskCard: {
    marginBottom: 12,
  },
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  status_pending: {
    backgroundColor: colors.warning,
  },
  status_completed: {
    backgroundColor: colors.success,
  },
  statusText: {
    color: colors.white,
    fontWeight: 'bold',
  },
  deleteButton: {
    padding: 8,
  },
  deleteButtonText: {
    color: colors.error,
    fontSize: 20,
    fontWeight: 'bold',
  },
  taskTitle: {
    fontSize: 16,
    color: colors.text,
    marginBottom: 4,
  },
  taskDate: {
    fontSize: 12,
    color: colors.gray,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: colors.background,
  },
  errorText: {
    color: colors.error,
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  retryButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default TasksScreen; 