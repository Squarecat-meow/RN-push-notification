import React from 'react';
import {Alert, Dimensions, SafeAreaView, StyleSheet} from 'react-native';

import messaging from '@react-native-firebase/messaging';
import WebView from 'react-native-webview';

const windowHeight = Dimensions.get('window').height;
const windowWidth = Dimensions.get('window').width;

function App(): React.JSX.Element {
  messaging().setBackgroundMessageHandler(async remoteMessage => {
    console.log('Message handled in the background!', remoteMessage);
  });

  React.useEffect(() => {
    const unsubscribe = messaging().onMessage(async remoteMessage => {
      Alert.alert('A new FCM Message Arrived!', JSON.stringify(remoteMessage));
    });
    return unsubscribe;
  });

  return (
    <SafeAreaView style={styles.container}>
      <WebView
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
