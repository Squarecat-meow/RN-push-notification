import React, {useRef, useState} from 'react';
import {
  Alert,
  Dimensions,
  PermissionsAndroid,
  Platform,
  SafeAreaView,
  StyleSheet,
} from 'react-native';

import messaging from '@react-native-firebase/messaging';
import WebView from 'react-native-webview';

const windowHeight = Dimensions.get('window').height;
const windowWidth = Dimensions.get('window').width;

function App(): React.JSX.Element {
  const [token, setToken] = useState('');
  const webViewRef = useRef<WebView>(null);

  messaging().setBackgroundMessageHandler(async remoteMessage => {
    console.log('Message handled in the background!', remoteMessage);
  });

  //iOS User Permission
  const iOSUserPermission = async () => {
    try {
      const authStatus = await messaging().requestPermission();
      const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;

      if (enabled) {
        console.log('authorization status:', authStatus);
        const apnsToken = await messaging().getAPNSToken();
        if (apnsToken) {
          const fcmToken = await messaging().getToken();
          setToken(fcmToken);
          console.log('current device token:', token);
        }
      } else {
        console.log('notification permission denied');
      }
    } catch (error) {
      console.log(error);
    }
  };

  //Andriod User Permission
  const androidUserPermission = async () => {
    const authStatus = await messaging().requestPermission();
    console.log('authorization status:', authStatus);
    try {
      const fcmToken = await messaging().getToken();
      if (Platform.OS === 'android') {
        console.log('android device token:', fcmToken);
        if (Platform.Version >= 33) {
          const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
          );
          if (fcmToken) {
            setToken(fcmToken);
          }
        }
        try {
          if (fcmToken) {
            setToken(fcmToken);
          }
        } catch (error) {
          console.log('andriod token API level below 32 error', error);
        }
      }
    } catch (error) {
      console.log('android error', error);
    }
  };

  React.useEffect(() => {
    Platform.OS === 'android' ? androidUserPermission() : iOSUserPermission();

    if (webViewRef.current) {
      webViewRef.current.postMessage(token);
    }

    const unsubscribe = messaging().onMessage(async remoteMessage => {
      Alert.alert('A new FCM Message Arrived!', JSON.stringify(remoteMessage));
    });
    return unsubscribe;
  });

  return (
    <SafeAreaView style={styles.container}>
      <WebView
        ref={webViewRef}
        source={{uri: 'http://localhost:3000/'}}
        style={styles.webview}
      />
    </SafeAreaView>
  );
}

export default App;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  webview: {
    flex: 1,
    width: windowWidth,
    height: windowHeight,
  },
});
