import React, { Component } from 'react';
import {
    StyleSheet,
    Text,
    View,
    Image,
    TouchableOpacity,
    Dimensions,
    AsyncStorage,
    Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import IconFA from 'react-native-vector-icons/FontAwesome';
import IconMaterial from 'react-native-vector-icons/MaterialCommunityIcons';
import { URL_WS } from '../Constantes';
import store from '../store'
const { width, height } = Dimensions.get('window')
const AVATAR_SIZE = 50
export default class Producto extends Component {
    state = {
        cantidad: 0
    }
    AgregarProducto = () => {
        var p = this.props.producto
        if (!p.id_detalle){
            // p.id_detalle=parseInt(p.producto_id+''+(store.getState().Nro_Pedido+1))
            p.id_detalle=this.props.cod_mesa+Date.now()
        }
        // if (!producto.id_detalle) {
            
        //     var id_detalle = producto.producto_id
        //     var found = store.getState().productos.find(p => {
        //         return (p.id_detalle == id_detalle && p.estado_detalle == 'CONFIRMA');
        //     });
        //     if (found) {
        //         p = {
        //             id_detalle : parseInt(producto.id_detalle + '' + store.getState().Nro_Pedido) + 1,
        //             almacen_cod: producto.almacen_cod,
        //             cod_marca: producto.cod_marca,
        //             cod_moneda: producto.cod_moneda,
        //             produto_id: producto.producto_id,
        //             nombre: producto.nombre,
        //             valor_precio: producto.valor_precio,
        //             simbolo: producto.simbolo,
        //             estado_detalle: 'PENDIENTE'
        //         }
        //         producto.id_detalle = p.id_detalle
        //     }else{
        //         p=producto
        //         p.id_detalle=producto.producto_id
                
        //     }
        // }else{
        //     p=producto
        // }
        p.estado_detalle = 'PENDIENTE'
        p.cantidad = this.state.cantidad + 1
        p.cod_mesa = this.props.cod_mesa
        p.numero = store.getState().Numero_Comprobante
        // var id_detalle = p.producto_id
        // var found = store.getState().productos.find(p => {
        //     return (p.id_detalle == id_detalle && p.estado_detalle == 'CONFIRMA');
        // });
        // p.id_detalle = found ? parseInt(p.producto_id + '' + store.getState().Nro_Pedido) + 1 : id_detalle
        this.setState({
            cantidad: p.cantidad
        }, () => {
            store.dispatch({
                type: 'ADD_PRODUCTO',
                producto: p,
            })
        })
    }
    RestarProducto = () => {
        if (parseInt(this.state.cantidad) > 0) {
            var producto = this.props.producto
            producto.cantidad = this.state.cantidad - 1
            producto.cod_mesa = this.props.cod_mesa
            producto.numero = store.getState().Numero_Comprobante
            producto.id_detalle = this.state.id_detalle
            this.setState({
                cantidad: producto.cantidad
            }, () => {
                store.dispatch({
                    type: 'RESTAR_PRODUCTO',
                    producto: producto,
                })
            })
        }
    }
    componentWillMount() {
        AsyncStorage.getItem('HOST_CONFIG').then(val=>{
            this.setState({URL_WS:val!=null?val:URL_WS})
        })
        var found = store.getState().productos.find(p => {
            return (p.estado_detalle != 'CONFIRMA' && p.producto_id == this.props.producto.producto_id && p.cod_mesa == this.props.cod_mesa);
        });
        if (found) {
            this.setState({ cantidad: parseInt(found.cantidad),id_detalle:found.id_detalle })
        }
    }
    componentDidMount() {
        store.subscribe(() => {
            if (this.refs.root) {
                if ((store.getState().last_event == 'ADD_PRODUCTO' ||
                    store.getState().last_event == 'RESTAR_PRODUCTO') &&
                    this.props.producto.producto_id == store.getState().last_producto.producto_id &&
                    this.props.cod_mesa == store.getState().last_producto.cod_mesa) {
                    this.setState({
                        cantidad: store.getState().last_producto.cantidad
                    })
                }
                if ((store.getState().last_event == 'DELETE_PRODUCTO') &&
                    this.props.producto.producto_id == store.getState().last_producto.producto_id &&
                    this.props.cod_mesa == store.getState().last_producto.cod_mesa) {
                    this.setState({
                        cantidad: 0
                    })
                }
                if ((store.getState().last_event == 'ADD_NUMERO_COMPROBANTE')) {
                    if (this.props.producto.estado_detalle == 'CONFIRMA')
                        this.setState({
                            cantidad: 0
                        })
                }
            }
        });
    }
    render() {
        const moneda = 'S/. '
        console.log(this.props.URL_WS)
        return (
            <View ref="root" style={styles.container}>
                <View style={{ flexDirection: 'row', flex: 1, alignItems: 'center', marginBottom: 0, marginTop: 5, padding: 5 }}>

                    <Image
                        source={{ uri: this.props.URL_WS+'/images/'+this.props.producto.imagen_url }}
                        //source={require('../images/plato_default.png')}
                        style={{
                            marginLeft: 10,
                            width: AVATAR_SIZE, height: AVATAR_SIZE
                            ,borderRadius:10
                        }} />

                    <View style={{ flexDirection: 'column', marginHorizontal: 10, }}>
                        <Text style={{ color: '#95a5a6', fontWeight: 'bold' }}>{this.props.producto.nombre}</Text>
                        {this.props.producto.precios<2 &&<Text style={{ color: '#95a5a6', }}>{this.props.producto.simbolo + (parseFloat(this.props.producto.valor_precio)).toFixed(2)}</Text>}
                    </View>

                </View>

                {(this.props.producto.detalles == 0 && this.props.producto.precios == 1)
                    ? <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        {this.state.cantidad > 0 &&
                            <TouchableOpacity onPress={() => this.RestarProducto()} style={{ paddingLeft: 50, marginRight: 10 }}>
                                <IconMaterial color={"#55efc4"} name='minus-box-outline' size={25} />
                            </TouchableOpacity>}
                        {this.state.cantidad > 0 &&
                            <Text style={{ fontWeight: 'bold' }} >{this.state.cantidad}</Text>}
                        <TouchableOpacity onPress={() => this.AgregarProducto()} style={{ marginHorizontal: 10, paddingLeft: this.state.cantidad > 0 ? 0 : 50 }}>
                            <IconMaterial color={"#55efc4"} name='plus-box-outline' size={25} />
                        </TouchableOpacity>
                    </View> :
                    <TouchableOpacity onPress={() => this.props.navigate('producto_detalle', { producto: this.props.producto, cod_mesa: this.props.cod_mesa })}
                        style={{ marginHorizontal: 10, borderColor: '#55efc4', borderWidth: 2, marginLeft: 50, padding: 5, borderRadius: 5, flexDirection: 'row', alignItems: 'center' }}>
                        <Text style={{ color: '#00b894', marginRight: 4 }} >Agregar</Text>

                    </TouchableOpacity>}

            </View>
        );

    }
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#FFF',
        // shadowColor: 'black',
        // shadowOpacity: .2,
        // elevation: 2,
        // marginVertical: 2,
        //borderRadius: 10,
        borderBottomWidth: 0.5,
        borderColor: '#eee',
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 3
    },
    image: {
        width: 50,
        height: 50,

    },
    info: {
        flexDirection: 'column',
    },
    name: {
        fontSize: 11,
        textAlign: 'left',
        fontWeight: 'bold',
        marginLeft: 5
    },
    subTitulo: {
        marginLeft: 5,
        fontSize: 11,
        fontWeight: 'bold',
        color: 'darkgray'
    },
    descripcion: {
        fontSize: 11,
        color: 'darkgray'
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginHorizontal: 30,
        marginTop: 15
    },
    iconContainer: {
        flexDirection: 'column',
        flex: 1,

    },
    icon: {
        alignItems: 'center',
    },
    count: {
        color: 'gray',
        textAlign: 'center'
    },
    avatar: {
        marginLeft: 15,
        width: AVATAR_SIZE,
        height: AVATAR_SIZE,
        borderRadius: AVATAR_SIZE / 2,
    },

});