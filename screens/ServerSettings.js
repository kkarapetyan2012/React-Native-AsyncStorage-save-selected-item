import React, { useState, useEffect } from 'react';
import { View, Text, Button, Image, StyleSheet, Pressable, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ServerSettings = () => {
  const [serverUrl, setServerUrl] = useState('');
  const [regions, setRegions] = useState([]);
  const [selectedRegion, setSelectedRegion] = useState(null);

  // Function to check the presence of serverUrl in AsyncStorage
  const checkServerUrlInStorage = async () => {
    try {
      const storedServerUrl = await AsyncStorage.getItem('serverUrl');
      const storedSelectedRegion = await AsyncStorage.getItem('selectedRegion');
      
      if (storedServerUrl) {
        // Server URL is present in AsyncStorage, set it to state
        setServerUrl(storedServerUrl);
        // Fetch and set the selected region based on the stored serverUrl
        const selectedRegionData = regions.find(region => region.serverUrl === storedServerUrl);
        setSelectedRegion(selectedRegionData);
      } else {
        // Server URL is not present, fetch and display region names
        fetchRegionNames();
      }

      if (storedSelectedRegion) {
        // Set the selected region if it's present in AsyncStorage
        setSelectedRegion(JSON.parse(storedSelectedRegion));
      }

    } catch (error) {
      console.error('Error checking server URL in AsyncStorage:', error);
    }
  };

  // Function to fetch and display region names
  const fetchRegionNames = async () => {
    try {
      const response = await fetch('https://api.redro.ru/api/settings/get-servers');

      if (!response.ok) {
        if (response.status === 404) {
          // Handle HTTP 404 error
          Alert.alert('API endpoint not found');
          // You can update the state or show a message to the user
        } else {
          throw new Error(`Failed to fetch regions - ${response.statusText}`);
        }
      }

      const data = await response.json();
      const newData = data.payload;
      setRegions(newData); // Assuming the response is an array of region names
    } catch (error) {
      console.error('Error fetching region names:', error);
    }
  };

  // Function to handle region selection and store serverUrl in AsyncStorage
  const handleRegionSelection = async (selectedRegion) => {
    setServerUrl(selectedRegion.serverUrl);
    setSelectedRegion(selectedRegion);
    // Store the selected serverUrl in AsyncStorage
    try {
      await AsyncStorage.setItem('serverUrl', selectedRegion.serverUrl);
      await AsyncStorage.setItem('selectedRegion', JSON.stringify(selectedRegion));
    } catch (error) {
      console.error('Error storing server URL in AsyncStorage:', error);
    }
  };

  // Function to handle removing serverUrl from AsyncStorage
  const handleRemoveServerUrl = async () => {
    try {
      await AsyncStorage.removeItem('serverUrl');
      await AsyncStorage.removeItem('selectedRegion');
      setServerUrl(''); // Clear the serverUrl in the state
      setSelectedRegion(null); // Clear the selected region
      fetchRegionNames();
    } catch (error) {
      console.error('Error removing server URL from AsyncStorage:', error);
    }
  };

  // useEffect to check serverUrl in AsyncStorage on component mount
  useEffect(() => {
    checkServerUrlInStorage();
  }, []);

  return (
    <View>
      {serverUrl ? (
        <View>
          <Text>Server URL: {serverUrl}</Text>
          <Button title="Remove Server URL" onPress={handleRemoveServerUrl} />
        </View>
      ) : (
        <View>
          <Text>Select a region:</Text>
          {Array.isArray(regions) ? (
            regions?.map((region, index) => (
              <Pressable key={index} onPress={() => handleRegionSelection(region)}>
                <Text>{region.countryName.am}</Text>
                <Image 
                  style={styles.img} 
                  source={{
                    uri: region.iconUrl
                  }} 
                  alt={`${selectedRegion?.countryName.am}`} 
                />
              </Pressable>
            ))
          ) : (
            <Text>Loading regions...</Text>
          )}
        </View>
      )}

      {/* Display only the selected item */}
      {selectedRegion && (
        <View>
          <Text>Selected Region: {selectedRegion?.countryName.ru}</Text>
          <Text>Selected Server URL: {selectedRegion.serverUrl}</Text>
          <Image 
            style={styles.img} 
            source={{
              uri: selectedRegion.iconUrl
            }} 
            alt={`${selectedRegion?.countryName.am}`} 
          />
        </View>
      )}
      
    </View>
  );
};

export default ServerSettings;

const styles = StyleSheet.create({
  img: {
    width: 50,
    height: 50
  }
})