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
    Text,
    Dimensions,
    Vibration,
    TouchableOpacity,
} from 'react-native';
import { NavigationActions } from 'react-navigation'
import WifiManager from 'react-native-wifi-manager'
import Camera from 'react-native-camera'
import { ProgressDialog } from 'react-native-simple-dialogs';
import IconMaterial from 'react-native-vector-icons/MaterialCommunityIcons';
import { URL_WS } from '../Constantes'
import store from '../store'
export default class Splash extends Component<{}> {
    static navigationOptions = {
        header: null,
        tabBarLabel: 'Splash',
    };
    constructor() {
        super()
        console.ignoredYellowBox = [
            'Setting a timer'
        ];
        this.state = {
            scanning: true,
            resultado: '',
            Cod_Mesa: store.getState().Cod_Mesa,
            sin_acceso: false
        }
    }
    _handleBarCodeRead(e) {
        Vibration.vibrate();
        this.setState({
            scanning: false,
            resultado: e.data,
            conectando: true,
            Cod_Mesa: e.data.split(';')[2]
        }, () => {
            WifiManager.status((status) => {
                if (status == 'CONNECTED') {
                    this.RecuperarMesaByCod_Mesa(e.data.split(';')[2])
                } else {
                    this.conectarToWifi(e.data.split(';')[0], e.data.split(';')[1], e.data.split(';')[2])
                }
            });

        });

    }
    conectarToWifi = (ssid, password, Cod_Mesa) => {
        WifiManager.connect(ssid, password);
        var verificarConexion = setInterval(() => {
            WifiManager.status((status) => {
                if (status == 'CONNECTED') {
                    clearInterval(verificarConexion)
                    this.RecuperarMesaByCod_Mesa(Cod_Mesa)
                }
            });
        }, 1000)
    }

    RecuperarMesaByCod_Mesa = (Cod_Mesa) => {
        this.setState({ conectando: true })
        const parametros = {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                usuario: store.getState().nombre_usuario
            })
        }
        fetch(URL_WS + '/get_mesas_estado', parametros)
            .then((response) => response.json())
            .then((data) => {
                this.setState({ conectando: false, mesas: data.mesas })
                var m = data.mesas.find(p => {
                    return (p.Cod_Mesa == Cod_Mesa);
                });
                this.SeleccionarMesa(m.Cod_Mesa, m.Nom_Mesa, m.Estado_Mesa)
            })
    }

    SeleccionarMesa = (Cod_Mesa, Nom_Mesa, Estado_Mesa) => {

        const parametros = {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                Cod_Mesa: Cod_Mesa
            })
        }
        fetch(URL_WS + '/get_productos_by_mesa', parametros)
            .then((response) => response.json())
            .then((data) => {
                this.setState({ conectando: false })
                store.dispatch({
                    type: 'MESA_SELECCIONADA',
                    Cod_Mesa: Cod_Mesa,
                    Nom_Mesa: Nom_Mesa
                })
                store.dispatch({
                    type: 'ADD_PRODUCTOS_SELECCIONADOS',
                    productos: data.productos_selec.filter(p => p.Id_Referencia == 0),
                    producto_detalles: data.productos_selec.filter(p => p.Id_Referencia != 0)
                })
                //if (data.productos_selec.length > 0) {

                store.dispatch({
                    type: 'ADD_NUMERO_COMPROBANTE',
                    Numero_Comprobante: data.productos_selec.length > 0 ? data.productos_selec[0].Numero : '',
                })

                //this.props.navigation.navigate('main', { productos_selec: data.productos_selec })
                const mesa = NavigationActions.reset({
                    index: 0,
                    actions: [
                        NavigationActions.navigate({ routeName: 'main', params: { productos_selec: data.productos_selec } })
                    ]
                })
                this.props.navigation.dispatch(mesa)

            })
            .catch(err => {
                this.setState({ sin_acceso: true, conectando: false })
            })
    }
    componentWillMount() {
        if (store.getState().tipo_usuario == 'EMPLEADO' && store.getState().id_usuario) {
            const vista_mesas = NavigationActions.reset({
                index: 0,
                actions: [
                    NavigationActions.navigate({ routeName: 'mesas' })
                ]
            })
            this.props.navigation.dispatch(vista_mesas)
        } else if (store.getState().tipo_usuario != 'EMPLEADO' && store.getState().Cod_Mesa && store.getState().socket.connected) {
            this.RecuperarMesaByCod_Mesa(store.getState().Cod_Mesa)
        } else {
            this.setState({ sin_acceso: true })
        }
    }
    LoginPersonal = () => {
        this.props.navigation.navigate('login', { tipo_logueo: 'empleado' })
    }
    render() {
        const { navigate } = this.props.navigation;
        return (
            <View style={styles.container}>
                <StatusBar
                    backgroundColor="#2c2c54"
                    barStyle="default"
                />
                <ProgressDialog
                    activityIndicatorColor={"#9b59b6"}
                    activityIndicatorSize="large"
                    visible={this.state.conectando}
                    title="Conectando"
                    message="Por favor, espere..."
                />
                <Text style={{ textAlign: 'center', color: '#ffeaa7', fontWeight: 'bold', fontSize: 30, marginVertical: 10, }}>Pidelo</Text>
                <IconMaterial color="#ffeaa7" style={{ alignSelf: 'center' }}
                    name='silverware-variant' size={50} />
                {this.state.sin_acceso && <View style={styles.container}>

                    <View style={{ flex: 1, justifyContent: 'center' }}>
                        {this.state.scanning ?
                            <View style={styles.rectangleContainer}>

                                <Camera style={styles.camera}
                                    type={this.state.cameraType}
                                    onBarCodeRead={this._handleBarCodeRead.bind(this)}>
                                    <View style={styles.rectangleContainer}>
                                        <View style={styles.rectangle} />
                                    </View>
                                </Camera>
                                <Text style={styles.instructions}>Escanee el codigo QR de su mesa</Text>
                            </View> :
                            <TouchableOpacity onPress={() => this.setState({ scanning: true })} >
                                <Text style={{ color: '#ffeaa7', fontWeight: 'bold', alignSelf: 'center' }}>Volver a cargar</Text>
                            </TouchableOpacity>
                        }
                    </View>
                    <TouchableOpacity activeOpacity={0.7}
                        style={{
                            marginVertical: 10, padding: 10, marginHorizontal: 20,
                            height: 40, backgroundColor: '#55efc4', borderRadius: 5
                        }}
                        onPress={this.LoginPersonal} >
                        <Text style={{ color: '#40407a', alignSelf: 'center', fontWeight: '900', paddingHorizontal: 10 }}>INICIAR SESION</Text>
                    </TouchableOpacity>
                </View>}

            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#40407a',
    },
    camera: {
        flex: 0,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'transparent',
        height: Dimensions.get('window').width - 100,
        width: Dimensions.get('window').width,
    },
    welcome: {
        fontSize: 20,
        textAlign: 'center',
        margin: 10,
    },
    instructions: {
        textAlign: 'center',
        color: '#ffeaa7',
        marginVertical: 10,

    },
    rectangleContainer: {
        backgroundColor: 'transparent',
    },

    rectangle: {
        height: 200,
        width: 200,
        borderWidth: 2,
        borderColor: '#33d9b2',
        backgroundColor: 'transparent',
    },
});