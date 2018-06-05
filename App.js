import React from 'react';
import { Platform } from 'react-native';
import { StackNavigator, TabNavigator,DrawerNavigator } from 'react-navigation';

import LectorQR from './src/screens/LectorQR'
import Home from './src/screens/Home'
import Pedido from './src/screens/Pedido'
import Splash from './src/screens/Splash'
import Login from './src/screens/Login';
import Mesas from './src/screens/Mesas';
import ProductoDetalle from './src/screens/ProductoDetalle';

const Main = TabNavigator({
  home: {
    screen: Home,
    path: 'home',
  },
  pedido: {
    screen: Pedido,
    path: 'pedido',
  }
}, {
    tabBarPosition: 'bottom',
    animationEnabled: false,
    swipeEnabled:false,
    tabBarOptions: {
      activeTintColor: '#55efc4',
      labelStyle: {
        fontSize: 10,
      },
      style: {
        backgroundColor: '#40407a',
      },
      showIcon: true,
      showLabel: true,
      indicatorStyle: { backgroundColor: 'transparent' }
    },
    lazy:true,

  });

const App = StackNavigator(
  {
    splash: {
      screen: Splash,
    },
    main: {
      screen: Home,
    },
    lectorQR:{
      screen:LectorQR
    },
    login:{
      screen:Login
    },
    mesas:{
      screen:Mesas
    },
    pedido: {
      screen: Pedido,
    },
    producto_detalle:{
      screen: ProductoDetalle
    }
  },
  {
    initialRouteName: 'login',
    //headerMode: 'none',
    /*
   * Use modal on iOS because the card mode comes from the right,
   * which conflicts with the drawer example gesture
   */
    mode: Platform.OS === 'ios' ? 'modal' : 'card',
  });
  


export default App;