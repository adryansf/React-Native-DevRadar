import React, { useState, useEffect, useRef } from "react";
import {
  View,
  StyleSheet,
  Image,
  Text,
  TextInput,
  TouchableOpacity
} from "react-native";
import MapView, { Marker, Callout } from "react-native-maps";
import {
  requestPermissionsAsync,
  getCurrentPositionAsync
} from "expo-location";
import { MaterialIcons } from "@expo/vector-icons";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

import api from "../services/api";

export default function Main({ navigation }) {
  const [devs, setDevs] = useState([]);
  const [currentRegion, setCurrentRegion] = useState(null);
  const [techs, setTechs] = useState("");

  useEffect(() => {
    async function loadInitPosition() {
      const { granted } = await requestPermissionsAsync();

      if (granted) {
        const { coords } = await getCurrentPositionAsync({
          enableHighAccuracy: true
        });

        const { latitude, longitude } = coords;

        setCurrentRegion({
          latitude,
          longitude,
          latitudeDelta: 0.04,
          longitudeDelta: 0.04
        });
      }
    }

    loadInitPosition();
  }, []);

  async function loadDevs() {
    const { latitude, longitude } = currentRegion;
    try {
      const response = await api.get("/search", {
        params: { latitude, longitude, techs }
      });
      setDevs(response.data);
    } catch (e) {}
  }

  function handleRegionChange(region) {
    setCurrentRegion(region);
  }

  if (!currentRegion) {
    return null;
  }

  return (
    <React.Fragment>
      <MapView
        style={styles.map}
        initialRegion={currentRegion}
        onRegionChangeComplete={handleRegionChange}
      >
        {devs &&
          devs.map(dev => (
            <Marker
              key={dev._id}
              coordinate={{
                longitude: dev.location.coordinates[0],
                latitude: dev.location.coordinates[1]
              }}
            >
              <Image
                source={{
                  uri: dev.avatar_url
                }}
                style={styles.avatar}
              />

              <Callout
                onPress={() => {
                  navigation.navigate("Profile", {
                    github_username: dev.github_username
                  });
                }}
              >
                <View style={styles.callout}>
                  <Text style={styles.devName}>{dev.name}</Text>
                  <Text style={styles.devBio}>{dev.bio}</Text>
                  <Text style={styles.devTechs}>{dev.techs.join(", ")}</Text>
                </View>
              </Callout>
            </Marker>
          ))}
      </MapView>

      <View style={styles.searchForm}>
        <TextInput
          style={styles.searchInput}
          placeholder={"Buscar devs por techs. Ex: React,PHP"}
          placeholderTextColor="#999"
          autoCapitalize="words"
          autoCorrect={false}
          value={techs}
          onChangeText={setTechs}
        />
        <TouchableOpacity onPress={() => loadDevs()} style={styles.loadButton}>
          <MaterialIcons name="my-location" size={20} color="#FFF" />
        </TouchableOpacity>
      </View>
    </React.Fragment>
  );
}

const styles = StyleSheet.create({
  map: {
    flex: 1
  },
  avatar: {
    width: 54,
    height: 54,
    borderRadius: 4,
    borderWidth: 4,
    borderColor: "#fff"
  },
  callout: {
    width: 260
  },
  devName: {
    fontWeight: "bold",
    fontSize: 16
  },
  devBio: {
    color: "#666",
    marginTop: 5
  },
  devTechs: {
    marginTop: 5
  },
  searchForm: {
    position: "absolute",
    top: 20,
    left: 20,
    right: 20,
    zIndex: 5,
    flexDirection: "row"
  },
  searchInput: {
    flex: 1,
    height: 50,
    backgroundColor: "#fff",
    color: "#333",
    borderRadius: 25,
    paddingHorizontal: 20,
    fontSize: 16,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowOffset: {
      width: 4,
      height: 4
    },
    elevation: 2
  },
  loadButton: {
    width: 50,
    height: 50,
    backgroundColor: "#8e4dff",
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 15
  }
});
