import { useEffect } from 'react';
import { useAppContext } from '../store';
import { useAudio } from '../hooks/useAudio';

export function TripNotificationHandler() {
  const { trips, updateTrip } = useAppContext();
  const { playSuccess } = useAudio();

  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;

    const handleMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === 'END_TRIP') {
        const tripId = event.data.tripId;
        const trip = trips.find(t => t.id === tripId);
        if (trip && trip.status === 'ongoing') {
          updateTrip({
            ...trip,
            status: 'completed',
            endTime: Date.now(),
          });
          playSuccess();
        }
      }
    };

    navigator.serviceWorker.addEventListener('message', handleMessage);
    return () => {
      navigator.serviceWorker.removeEventListener('message', handleMessage);
    };
  }, [trips, updateTrip, playSuccess]);

  return null;
}
