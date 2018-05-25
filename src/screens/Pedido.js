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
    Dimensions,
    StatusBar,
    Platform,
    Text,
    FlatList,
    TouchableOpacity,
    Alert
} from 'react-native';
import { NavigationActions } from 'react-navigation'
import Icon from 'react-native-vector-icons/Ionicons';
import IconMaterial from 'react-native-vector-icons/MaterialCommunityIcons';
import IconFondation from 'react-native-vector-icons/Foundation'
const { width, height } = Dimensions.get('window')
import ProductoSeleccionado from '../components/ProductoSeleccionado'
import { URL_WS } from '../Constantes'
import store from '../store'
import { Dialog, ProgressDialog } from 'react-native-simple-dialogs';
import BusquedaDoc from '../components/BusquedaDoc'
export default class Pedido extends Component<{}> {
    static navigationOptions = ({ navigation }) => {
        const params = navigation.state.params || {};
        return {
            title: 'Pedido',
            headerTintColor: '#55efc4',
            headerBackTitle: 'Atras',
            headerStyle: {
                backgroundColor: '#40407a',
            },
            headerRight: (
                store.getState().tipo_usuario == 'EMPLEADO' &&
                <TouchableOpacity onPress={params.AbrirOpciones} style={{ paddingHorizontal: 10 }}>
                    <IconMaterial color={'#55efc4'} name='dots-vertical' size={25} />
                </TouchableOpacity>

            ),

        }
    }
    constructor() {
        super()
        console.ignoredYellowBox = [
            'Setting a timer'
        ];
        this.state = {
            productos: store.getState().productos.filter(p => p.cod_mesa == store.getState().cod_mesa && p.numero == store.getState().Numero_Comprobante),
            total: 0,
            Numero_Comprobante: store.getState().Numero_Comprobante,
            Nom_Cliente: 'CLIENTES VARIOS'
        }
    }
    componentWillMount() {
        this.props.navigation.setParams({ AbrirOpciones: this._AbrirOpciones });
    }
    _AbrirOpciones = () => {
        this.setState({ OpcionesVisible: true })
    }
    componentDidMount() {
        this.CalcularTotal(this.state.productos)
        store.subscribe(() => {
            if (this.refs.ref_pedido) {

                this.setState({
                    productos: []
                }, () => {

                    productos = store.getState().productos.filter(p => p.cod_mesa == store.getState().cod_mesa)
                    this.setState({ productos: productos })
                    this.CalcularTotal(productos)

                })
            }
        })
    }
    HacerPedido = () => {
        this.setState({ cargando: true })
        Producto = this.state.productos.filter(p => {
            if (p.estado_detalle != 'CONFIRMADO')
                return p
            else
                return null
        })
        Producto_Detalles = store.getState().producto_detalles.filter(p => {
            if ((p.cod_mesa == store.getState().cod_mesa && p.estado_detalle != 'CONFIRMADO')) {
                return p
            } else {
                return null
            }

        })
        const parametros = {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                cod_mesa: store.getState().cod_mesa,
                Productos: Producto.concat(Producto_Detalles),
                Cod_Moneda: this.state.productos[0].Cod_Moneda,
                numero: this.state.Numero_Comprobante,
                Nom_Cliente: this.state.Nom_Cliente,
                Total: this.state.productos.reduce((a, b) => a + (b.valor_precio * b.cantidad), 0),
                Cod_Vendedor: store.getState().id_usuario,
                estado_accion: 'PENDIENTE'
            })
        }
        fetch(URL_WS + '/hacer_pedido_sql', parametros)
            .then((response) => response.json())
            .then((data) => {
                if (data.respuesta == 'ok') {
                    this.setState({
                        Numero_Comprobante: data.numero,
                        productos: this.state.productos.filter(p => {
                            p.numero = data.numero
                            return p
                        }),
                        cargando: false
                    })
                    store.dispatch({
                        type: 'ADD_NUMERO_COMPROBANTE',
                        Numero_Comprobante: data.numero
                    })
                    store.dispatch({
                        type: 'ADD_ESTADO_MESA',
                        estado_accion: 'PENDIENTE'

                    })
                    //Guardar numero
                    Alert.alert('Gracias!', 'Tu pedido esta en cola')
                } else {
                    Alert.alert('Sucedio algo!', 'Vuelve a intentarlo o nuestro vendra a ayudarlo')
                }
            })
    }
    ConfirmarPedido = () => {
        this.setState({ cargando: true })
        Producto = this.state.productos.filter(p => {
            if (p.estado_detalle != 'CONFIRMA') {
                p.estado_detalle = 'CONFIRMA'
                return p
            }
            else
                return null
        })
        Producto_Detalles = store.getState().producto_detalles.filter(p => {
            if ((p.cod_mesa == store.getState().cod_mesa && p.estado_detalle != 'CONFIRMA')) {
                p.estado_detalle = 'CONFIRMA'
                return p
            } else {
                return null
            }

        })
        const parametros = {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                cod_mesa: store.getState().cod_mesa,
                productos: Producto.concat(Producto_Detalles),
                cod_moneda: this.state.productos[0].cod_moneda,
                numero: this.state.Numero_Comprobante,
                nombre_cliente: this.state.Nom_Cliente,
                total: this.state.productos.reduce((a, b) => a + (b.valor_precio * b.cantidad), 0),//+ Producto_Detalles.reduce((a, b) => a + (b.valor_precio * b.cantidad), 0),
                usuario_registro: store.getState().id_usuario,
                estado_detalle:'CONFIRMA',
                estado_pedido: 'OCUPADO',
            })
        }
        fetch(URL_WS + '/ws/confirmar_ecaja_pedido', parametros)
            .then((response) => response.json())
            .then((data) => {
                if (!data.err) {
                    this.setState({
                        Numero_Comprobante: data.numero,
                        productos: this.state.productos.filter(p => {
                            p.numero = data.numero
                            p.estado_detalle = 'CONFIRMA'
                            return p
                        }),
                        cargando: false
                    })
                    store.dispatch({
                        type: 'ADD_NUMERO_COMPROBANTE',
                        Numero_Comprobante: data.numero

                    })
                    if (this.state.Numero_Comprobante == "") {

                        store.dispatch({
                            type: 'ADD_ESTADO_MESA',
                            estado_accion: 'OCUPADO'

                        })
                    }
                    //Guardar numero
                    // Alert.alert('Gracias!', 'Tu pedido esta en cola')
                    const vista_mesas = NavigationActions.reset({
                        index: 0,
                        actions: [
                            NavigationActions.navigate({ routeName: 'mesas' })
                        ]
                    })
                    this.props.navigation.dispatch(vista_mesas)
                } else {
                    Alert.alert('Sucedio algo!', data.err)
                }
            })
    }
    ImprimirNotaVenta = () => {
        this.setState({ cargando: true })
        Producto = this.state.productos.filter(p => p.estado_detalle == 'CONFIRMA')
        Producto_Detalles = store.getState().producto_detalles.filter(p => (p.cod_mesa == store.getState().cod_mesa && p.estado_detalle == 'CONFIRMA' && p.numero==this.state.Numero_Comprobante))
        const parametros = {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                cod_mesa: store.getState().cod_mesa,
                Productos: Producto.concat(Producto_Detalles),
                Cod_Moneda: this.state.productos[0].Cod_Moneda,
                numero: this.state.Numero_Comprobante,
                Nom_Cliente: this.state.Nom_Cliente,
                Total: this.state.productos.reduce((a, b) => a + (b.valor_precio * b.cantidad), 0), //+ Producto_Detalles.reduce((a, b) => a + (b.valor_precio * b.cantidad), 0),
                Cod_Vendedor: store.getState().id_usuario,
                estado_accion: 'OCUPADO',
            })
        }
        fetch(URL_WS + '/impresion_nota_venta', parametros)
            .then((response) => response.json())
            .then((data) => {
                if (data.respuesta == 'ok') {
                    Alert.alert('Impresion!', 'Se imprimio correctamente')
                }
                this.setState({
                    cargando: false,
                    OpcionesVisible: false
                })
            })
    }

    LiberarMesa = () => {
        this.setState({ cargando: true })
        const parametros = {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                cod_mesa: store.getState().cod_mesa,
                numero: store.getState().Numero_Comprobante,
                Cod_Vendedor: store.getState().id_usuario,
            })
        }
        fetch(URL_WS + '/Liberar_Terminar_Mesa', parametros)
            .then((response) => response.json())
            .then((data) => {
                if (data.respuesta == "ok") {
                    store.dispatch({
                        type: 'LIBERAR_MESA',
                        cod_mesa: data.cod_mesa,
                        numero: data.numero
                    })
                    store.dispatch({
                        type: 'ADD_ESTADO_MESA',
                        estado_accion: 'LIBRE'
                    })
                    this.setState({ OpcionesVisible: false, cargando: false })
                    this.props.navigation.goBack()
                } else {
                    alert('Ocurrio un error vuelva a intentarlo')
                }

            })
    }
    CancelarPedido = () => {
        this.setState({ cargando: true })
        const parametros = {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                cod_mesa: store.getState().cod_mesa,
                numero: store.getState().Numero_Comprobante,
            })
        }
        fetch(URL_WS + '/Cancelar_Mesa_Pedido', parametros)
            .then((response) => response.json())
            .then((data) => {
                if (data.respuesta == "ok") {
                    store.dispatch({
                        type: 'LIBERAR_MESA',
                        cod_mesa: store.getState().cod_mesa,
                        numero: store.getState().Numero_Comprobante
                    })
                    store.dispatch({
                        type: 'ADD_ESTADO_MESA',
                        estado_accion: 'LIBRE'
                    })
                    this.setState({ OpcionesVisible: false, cargando: false })
                    this.props.navigation.goBack()
                } else {
                    alert('Ocurrio un error vuelva a intentarlo')
                }

            })
    }
    CalcularTotal = (productos) => {
        this.setState({ total: productos.reduce((a, b) => a + (b.estado_detalle != 'CONFIRMADO' ? b.valor_precio * b.cantidad : 0), 0) })

    }
    render() {
        const { navigate } = this.props.navigation;
        return (
            <View ref='ref_pedido' style={styles.container}>
                <View style={{ backgroundColor: '#FFF', justifyContent: 'center' }}>
                    <Text style={{ color: '#333', paddingVertical: 5, fontWeight: 'bold', marginHorizontal: 15 }}>{store.getState().nombre_mesa}</Text>
                </View>
                <FlatList
                    data={this.state.productos}
                    renderItem={({ item }) => (
                        <ProductoSeleccionado producto={item} navigate={navigate} />
                    )}
                    keyExtractor={(item, index) => index}
                />
                {store.getState().tipo_usuario != 'EMPLEADO'
                    && this.state.productos.filter(p => p.estado_detalle != 'CONFIRMA').length > 0
                    && this.state.productos.length > 0 &&
                    <TouchableOpacity activeOpacity={0.5} onPress={this.HacerPedido}
                        style={{ height: 50, borderRadius: 5, marginHorizontal: 10, marginVertical: 10, backgroundColor: '#00b894', justifyContent: 'center' }}>
                        <Text style={{ fontWeight: 'bold', color: '#FFF', alignSelf: 'center' }}>HACER PEDIDO S/.{this.state.total.toFixed(2)}</Text>
                    </TouchableOpacity>}
                {store.getState().tipo_usuario == 'EMPLEADO'
                    && this.state.productos.filter(p => p.estado_detalle != 'CONFIRMA').length > 0 &&
                    <TouchableOpacity activeOpacity={0.5} onPress={this.ConfirmarPedido}
                        style={{ height: 50, borderRadius: 5, marginHorizontal: 10, marginVertical: 10, backgroundColor: '#ff7675', justifyContent: 'center' }}>
                        <Text style={{ fontWeight: 'bold', color: '#FFF', alignSelf: 'center' }}>CONFIRMAR PEDIDO S/.{this.state.total.toFixed(2)}</Text>
                    </TouchableOpacity>}
                <View activeOpacity={0.5} onPress={this.HacerPedido}
                    style={{ height: 50, borderRadius: 5, marginHorizontal: 10, marginVertical: 10, backgroundColor: '#fff', justifyContent: 'center' }}>
                    <Text style={{ fontWeight: 'bold', color: 'gray', alignSelf: 'center' }}>TOTAL PEDIDO S/.{this.state.productos.reduce((a, b) => a + (b.valor_precio * b.cantidad), 0).toFixed(2)}</Text>
                </View>
                <Dialog
                    visible={this.state.OpcionesVisible}
                    onTouchOutside={() => this.setState({ OpcionesVisible: false })} >
                    {this.state.productos.filter(p => p.estado_detalle == 'CONFIRMA').length > 0 &&
                    <View>
                        <TouchableOpacity activeOpacity={0.5} onPress={this.ImprimirNotaVenta}
                            style={{ marginVertical: 10, backgroundColor: '#fff' }}>
                            <Text style={{ fontWeight: 'bold', color: 'gray' }}>IMPRIMIR NOTA DE VENTA</Text>
                        </TouchableOpacity>
                        <TouchableOpacity activeOpacity={0.5} onPress={()=>this.setState({DialogAsignarNombre:true})}
                            style={{ marginVertical: 10, backgroundColor: '#fff' }}>
                            <Text style={{ fontWeight: 'bold', color: 'gray' }}>ASIGNAR NOMBRE(Factura)</Text>
                        </TouchableOpacity>
                        {/* <TouchableOpacity activeOpacity={0.5} onPress={this.LiberarMesa}
                            style={{ marginVertical: 10, backgroundColor: '#fff' }}>
                            <Text style={{ fontWeight: 'bold', color: 'gray' }}>TERMINAR PEDIDO Y LIBERAR MESA</Text>
                        </TouchableOpacity>
                        <TouchableOpacity activeOpacity={0.5} onPress={this.CancelarPedido}
                            style={{ marginVertical: 10, backgroundColor: '#fff' }}>
                            <Text style={{ fontWeight: 'bold', color: 'gray' }}>CANCELAR PEDIDO</Text>
                        </TouchableOpacity> */}
                    </View>}
                </Dialog>
                <Dialog
                visible={this.state.DialogAsignarNombre}
                onTouchOutside={() => this.setState({ DialogAsignarNombre: false })}>
                    <BusquedaDoc/>
                </Dialog>
                <ProgressDialog
                    activityIndicatorColor={"#9b59b6"}
                    activityIndicatorSize="large"
                    visible={this.state.cargando}
                    title="Cargando"
                    message="Por favor, espere..."
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