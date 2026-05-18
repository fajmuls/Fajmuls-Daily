import { useState, useCallback, useRef, useEffect } from 'react';

export function useVoiceCommand(onCommand?: (text: string) => void) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const recognitionRef = useRef<any>(null);
  const isManuallyStoppedRef = useRef(false);

  const startListening = useCallback(() => {
    if (!('webkitSpeechRecognition' in window)) {
      alert('Fitur suara tidak didukung di browsermu.');
      return;
    }

    const startRecording = () => {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.continuous = true;
      recognition.interimResults = false;
      recognition.lang = 'id-ID';

      recognition.onstart = () => {
        setIsListening(true);
        isManuallyStoppedRef.current = false;
      };

      recognition.onresult = (event: any) => {
        const current = event.resultIndex;
        const text = event.results[current][0].transcript;
        setTranscript(text);
        if (onCommand) {
          onCommand(text);
        }
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error', event.error);
      };

      recognition.onend = () => {
        // restart if not manually stopped
        if (!isManuallyStoppedRef.current) {
           startRecording();
        } else {
           setIsListening(false);
        }
      };

      recognition.start();
      recognitionRef.current = recognition;
    };

    startRecording();
  }, [onCommand]);

  const stopListening = useCallback(() => {
    isManuallyStoppedRef.current = true;
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsListening(false);
  }, []);

  // Cleanup
  useEffect(() => {
    return () => {
      isManuallyStoppedRef.current = true;
      if (recognitionRef.current) {
         recognitionRef.current.stop();
      }
    };
  }, []);

  return { isListening, transcript, startListening, stopListening };
}
