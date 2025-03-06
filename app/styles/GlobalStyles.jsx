import { StyleSheet, Dimensions } from 'react-native';

const { width: deviceWidth, height: deviceHeight } = Dimensions.get('window');

export const globalStyles = StyleSheet.create({ 
    safeArea: {
        flex: 1, // Full height
        backgroundColor: '#f8f9fa', // Light gray background
      },
      loginView: {
        flex: 1, // Takes full screen height
        padding: 16, // Adds spacing inside the container
        justifyContent: 'center', // Centers content vertically
        alignItems: 'center',
        backgroundColor: '#fff'
      },
      introImg: {
        width: deviceWidth * 0.9, height: deviceHeight * 0.6,
        border: "none"
      },
      signButton: {
        width: '100%', // Full width
    paddingVertical: 14, // Vertical padding
    backgroundColor: '#007bff', // Blue color
    borderRadius: 42,
    color: '#fff', // Rounded corners
    alignItems: 'center',
    fontFamily: 'arial',
    letterSpacing: 1
      },
      loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
      }
});