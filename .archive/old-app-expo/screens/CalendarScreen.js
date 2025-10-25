import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useTheme } from '../hooks/useTheme';
import { useStorage } from '../hooks/useStorage';
import { useNotifications } from '../hooks/useNotifications';
import { useAnimation } from '../hooks/useAnimation';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import SkeletonLoader from '../components/common/SkeletonLoader';
import { colors } from '../constants/colors';
import { useTranslation } from 'react-i18next';

const CalendarScreen = () => {
  const { t } = useTranslation();
  const { isDark } = useTheme();
  const { getItem, setItem } = useStorage();
  const { scheduleNotification } = useNotifications();
  const { animation: fadeAnimation } = useAnimation(0);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [viewMode, setViewMode] = useState('month'); // month, week, day
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const savedEvents = await getItem('events');
      if (savedEvents) {
        setEvents(JSON.parse(savedEvents));
      }
    } catch (error) {
      console.error('Error loading events:', error);
      setError('Failed to load events. Please check your connection.');
    } finally {
      setIsLoading(false);
    }
  };

  const saveEvents = async (updatedEvents) => {
    try {
      await setItem('events', JSON.stringify(updatedEvents));
      setEvents(updatedEvents);
    } catch (error) {
      console.error('Error saving events:', error);
    }
  };

  const addEvent = async (event) => {
    const newEvent = {
      id: Date.now(),
      ...event,
      createdAt: new Date().toISOString(),
    };

    const updatedEvents = [...events, newEvent];
    await saveEvents(updatedEvents);

    // Schedule notification for the event
    await scheduleNotification({
      title: t('Upcoming Event'),
      body: event.title,
      date: new Date(event.startTime),
    });
  };

  const deleteEvent = async (eventId) => {
    Alert.alert(
      t('Delete Event'),
      t('Are you sure you want to delete this event?'),
      [
        {
          text: t('Cancel'),
          style: 'cancel',
        },
        {
          text: t('Delete'),
          style: 'destructive',
          onPress: async () => {
            const updatedEvents = events.filter(event => event.id !== eventId);
            await saveEvents(updatedEvents);
          },
        },
      ]
    );
  };

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    return new Date(year, month, 1).getDay();
  };

  const renderMonthView = () => {
    const daysInMonth = getDaysInMonth(selectedDate);
    const firstDay = getFirstDayOfMonth(selectedDate);
    const days = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(<View key={`empty-${i}`} style={styles.dayCell} />);
    }

    // Add cells for each day of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), day);
      const dayEvents = events.filter(event => {
        const eventDate = new Date(event.startTime);
        return eventDate.toDateString() === date.toDateString();
      });

      days.push(
        <TouchableOpacity
          key={day}
          style={[
            styles.dayCell,
            date.toDateString() === new Date().toDateString() && styles.todayCell,
          ]}
          onPress={() => setSelectedDate(date)}
        >
          <Text style={styles.dayNumber}>{day}</Text>
          {dayEvents.length > 0 && (
            <View style={styles.eventIndicator}>
              <Text style={styles.eventCount}>{dayEvents.length}</Text>
            </View>
          )}
        </TouchableOpacity>
      );
    }

    return (
      <View style={styles.monthView}>
        <View style={styles.weekDays}>
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <Text key={day} style={styles.weekDay}>
              {t(day)}
            </Text>
          ))}
        </View>
        <View style={styles.daysGrid}>{days}</View>
      </View>
    );
  };

  const renderEvents = () => {
    const dayEvents = events.filter(event => {
      const eventDate = new Date(event.startTime);
      return eventDate.toDateString() === selectedDate.toDateString();
    });

    return (
      <View style={styles.eventsContainer}>
        <Text style={styles.eventsTitle}>
          {t('Events for')} {selectedDate.toLocaleDateString()}
        </Text>
        {dayEvents.map(event => (
          <Card key={event.id} style={styles.eventCard}>
            <View style={styles.eventHeader}>
              <Text style={styles.eventTitle}>{event.title}</Text>
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => deleteEvent(event.id)}
              >
                <Text style={styles.deleteButtonText}>×</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.eventTime}>
              {new Date(event.startTime).toLocaleTimeString()} -{' '}
              {new Date(event.endTime).toLocaleTimeString()}
            </Text>
            {event.description && (
              <Text style={styles.eventDescription}>{event.description}</Text>
            )}
          </Card>
        ))}
      </View>
    );
  };

  const renderError = () => (
    <View style={styles.errorContainer}>
      <Text style={styles.errorText} accessibilityRole="alert">
        {error || 'Unable to load events. Please check your connection.'}
      </Text>
      <TouchableOpacity
        style={styles.retryButton}
        onPress={loadEvents}
        accessibilityRole="button"
        accessibilityLabel="Retry loading events"
      >
        <Text style={styles.retryButtonText}>Retry</Text>
      </TouchableOpacity>
    </View>
  );

  // In the render, before events are loaded
  if (isLoading && (!events || events.length === 0)) {
    return (
      <View style={styles.container}>
        <SkeletonLoader rows={8} height={32} style={{ marginBottom: 12 }} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Button
          title={t('Month')}
          variant={viewMode === 'month' ? 'primary' : 'outline'}
          onPress={() => setViewMode('month')}
          style={styles.viewButton}
        />
        <Button
          title={t('Week')}
          variant={viewMode === 'week' ? 'primary' : 'outline'}
          onPress={() => setViewMode('week')}
          style={styles.viewButton}
        />
        <Button
          title={t('Day')}
          variant={viewMode === 'day' ? 'primary' : 'outline'}
          onPress={() => setViewMode('day')}
          style={styles.viewButton}
        />
      </View>

      {viewMode === 'month' && renderMonthView()}
      {renderEvents()}
      {error && renderError()}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  viewButton: {
    flex: 1,
    marginHorizontal: 4,
  },
  monthView: {
    padding: 16,
  },
  weekDays: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  weekDay: {
    flex: 1,
    textAlign: 'center',
    fontWeight: 'bold',
    color: colors.text,
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: '14.28%',
    aspectRatio: 1,
    padding: 4,
    borderWidth: 1,
    borderColor: colors.border,
  },
  todayCell: {
    backgroundColor: colors.primary + '20',
  },
  dayNumber: {
    fontSize: 16,
    color: colors.text,
  },
  eventIndicator: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    backgroundColor: colors.primary,
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  eventCount: {
    color: colors.white,
    fontSize: 12,
    fontWeight: 'bold',
  },
  eventsContainer: {
    padding: 16,
  },
  eventsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 16,
  },
  eventCard: {
    marginBottom: 12,
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
  },
  deleteButton: {
    padding: 8,
  },
  deleteButtonText: {
    color: colors.error,
    fontSize: 20,
    fontWeight: 'bold',
  },
  eventTime: {
    fontSize: 14,
    color: colors.gray,
    marginBottom: 4,
  },
  eventDescription: {
    fontSize: 14,
    color: colors.text,
  },
  errorContainer: {
    padding: 16,
    backgroundColor: colors.error + '10',
    borderRadius: 8,
    margin: 16,
    alignItems: 'center',
  },
  errorText: {
    color: colors.error,
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 12,
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

export default CalendarScreen; 