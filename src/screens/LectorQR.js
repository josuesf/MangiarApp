/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React, { Component } from 'react';
import {
    StyleSheet,
    View,
    AsyncStorage,
    StatusBar,
} from 'react-native';
import { NavigationActions } from 'react-navigation'

export default class LectorQR extends Component<{}> {
    static navigationOptions = {
        header: null,
        tabBarLabel: 'Splash',
    };
    constructor() {
        super()
        this.state = {}
    }
    componentWillMount() {
        
    }
    render() {
        const { navigate } = this.props.navigation;
        return (
            <View style={styles.container}>
                <StatusBar
                    backgroundColor="white"
                    barStyle="dark-content"
                />
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFF',
    },
});