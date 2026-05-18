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
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {}
      }

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
        let text = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          text += event.results[i][0].transcript;
        }
        text = text.trim();
        setTranscript(text);
        if (onCommand) {
          onCommand(text);
        }
      };

      recognition.onerror = (event: any) => {
        if (event.error === 'aborted') {
          console.warn('Speech recognition aborted');
          return;
        }
        console.error('Speech recognition error', event.error);
        if (event.error === 'not-allowed') {
          isManuallyStoppedRef.current = true;
          setIsListening(false);
        }
      };

      recognition.onend = () => {
        // restart if not manually stopped
        if (!isManuallyStoppedRef.current) {
           // delay a bit before restart to avoid 'aborted' race condition
           setTimeout(() => {
             if (!isManuallyStoppedRef.current) {
               try {
                 recognition.start();
               } catch (e) {
                 console.error("Failed to restart recognition:", e);
               }
             }
           }, 300);
        } else {
           setIsListening(false);
        }
      };

      try {
        recognition.start();
        recognitionRef.current = recognition;
      } catch (e) {
        console.error("Start error:", e);
      }
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
