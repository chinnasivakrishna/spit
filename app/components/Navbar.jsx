import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React from 'react'
import Icon from 'react-native-vector-icons/FontAwesome';

const Navbar = () => {
  return (
    <View style={styles.navbar}>
      
      
      {/* Profile Icon */}
      <TouchableOpacity onPress={() => alert('Profile Clicked')}>
        <Icon name="user" size={20} color="black" style={styles.icon}/>
        
      </TouchableOpacity>
      <Text> Welcome Rakesh</Text>

      {/* Logout Icon */}
      <TouchableOpacity onPress={() => alert('Logout Clicked')}>
        <Icon name="sign-out" size={20} color="black" />
      </TouchableOpacity>
    </View>
  );
}

export default Navbar

const styles = StyleSheet.create({
  navbar: {
    flexDirection: 'row', // Align icons in a row
    justifyContent: 'space-between', // Spread icons evenly
    alignItems: 'center',
    backgroundColor: '#fff', // Navbar background color
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  icon: {
    paddingRight: 15
  }
})