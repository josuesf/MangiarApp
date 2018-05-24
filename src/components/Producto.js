import React, { Component } from 'react';
import {
    StyleSheet,
    Text,
    View,
    Image,
    TouchableOpacity,
    Dimensions,
    AsyncStorage,
    Platform
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
        Cantidad: 0
    }
    AgregarProducto = () => {
        var producto = this.props.producto
        if (!producto.Id_Detalle) {
            console.log(producto)
            var Id_Detalle = producto.Id_Producto
            var found = store.getState().productos.find(p => {
                return (p.Id_Detalle == Id_Detalle && p.Estado_Pedido == 'CONFIRMA');
            });
            if (found) {
                p = {
                    Id_Detalle : parseInt(producto.Id_Producto + '' + store.getState().Nro_Pedido) + 1,
                    Cod_Almacen: producto.Cod_Almacen,
                    Cod_Marca: producto.Cod_Marca,
                    Cod_Moneda: producto.Cod_Moneda,
                    Cod_TipoOperatividad: producto.Cod_TipoOperatividad,
                    Cod_TipoPrecio: producto.Cod_TipoPrecio,
                    Cod_TipoProducto: producto.Cod_TipoProducto,
                    Definicion: producto.Definicion,
                    Des_CortaProducto: producto.Des_CortaProducto,
                    Des_LargaProducto: producto.Des_LargaProducto,
                    Id_Producto: producto.Id_Producto,
                    Nom_Marca: producto.Nom_Marca,
                    Nom_Moneda: producto.Nom_Moneda,
                    Nom_Precio: producto.Nom_Precio,
                    Nom_Producto: producto.Nom_Producto,
                    PrecioUnitario: producto.PrecioUnitario,
                    Simbolo: producto.Simbolo,
                    Estado_Pedido: 'PENDIENTE'
                }
                producto.Id_Detalle = p.Id_Detalle
            }else{
                p=producto
                p.Id_Detalle=producto.Id_Producto
                
            }
        }else{
            p=producto
        }
        p.Estado_Pedido = 'PENDIENTE'
        p.Cantidad = this.state.Cantidad + 1
        p.Cod_Mesa = this.props.Cod_Mesa
        p.Numero =store.getState().Numero_Comprobante
        // var Id_Detalle = p.Id_Producto
        // var found = store.getState().productos.find(p => {
        //     return (p.Id_Detalle == Id_Detalle && p.Estado_Pedido == 'CONFIRMA');
        // });
        // p.Id_Detalle = found ? parseInt(p.Id_Producto + '' + store.getState().Nro_Pedido) + 1 : Id_Detalle
        this.setState({
            Cantidad: p.Cantidad
        }, () => {
            store.dispatch({
                type: 'ADD_PRODUCTO',
                producto: p,
            })
        })
    }
    RestarProducto = () => {
        if (parseInt(this.state.Cantidad) > 0) {
            var producto = this.props.producto
            producto.Cantidad = this.state.Cantidad - 1
            producto.Cod_Mesa = this.props.Cod_Mesa
            this.setState({
                Cantidad: producto.Cantidad
            }, () => {
                store.dispatch({
                    type: 'RESTAR_PRODUCTO',
                    producto: producto,
                })
            })
        }
    }
    componentWillMount() {
        var found = store.getState().productos.find(p => {
            return (p.Estado_Pedido != 'CONFIRMA' && p.Id_Producto == this.props.producto.Id_Producto && p.Cod_Mesa == this.props.Cod_Mesa);
        });
        if (found) {
            this.setState({ Cantidad: parseInt(found.Cantidad) })
        }
    }
    componentDidMount() {
        store.subscribe(() => {
            if (this.refs.root) {
                if ((store.getState().last_event == 'ADD_PRODUCTO' ||
                    store.getState().last_event == 'RESTAR_PRODUCTO') &&
                    this.props.producto.Id_Producto == store.getState().last_producto.Id_Producto &&
                    this.props.Cod_Mesa == store.getState().last_producto.Cod_Mesa) {
                    this.setState({
                        Cantidad: store.getState().last_producto.Cantidad
                    })
                }
                if ((store.getState().last_event == 'DELETE_PRODUCTO') &&
                    this.props.producto.Id_Producto == store.getState().last_producto.Id_Producto &&
                    this.props.Cod_Mesa == store.getState().last_producto.Cod_Mesa) {
                    this.setState({
                        Cantidad: 0
                    })
                }
                if ((store.getState().last_event == 'ADD_NUMERO_COMPROBANTE')) {
                    if (this.props.producto.Estado_Pedido == 'CONFIRMA')
                        this.setState({
                            Cantidad: 0
                        })
                }
            }
        });
    }
    render() {
        const moneda = 'S/. '
        return (
            <View ref="root" style={styles.container}>
                <View style={{ flexDirection: 'row', flex: 1, alignItems: 'center', marginBottom: 0, marginTop: 5, padding: 5 }}>

                    <Image
                        source={{ uri: URL_WS+'/images/'+this.props.producto.imagen_url }}
                        //source={require('../images/plato_default.png')}
                        style={{
                            marginLeft: 10,
                            width: AVATAR_SIZE, height: AVATAR_SIZE
                        }} />

                    <View style={{ flexDirection: 'column', marginHorizontal: 10, }}>
                        <Text style={{ color: '#95a5a6', fontWeight: 'bold' }}>{this.props.producto.nombre}</Text>
                        <Text style={{ color: '#95a5a6', }}>{this.props.producto.simbolo + (parseFloat(this.props.producto.valor_precio)).toFixed(2)}</Text>
                    </View>

                </View>

                {(this.props.producto.detalles == 0 && this.props.producto.precios == 1)
                    ? <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        {this.state.Cantidad > 0 &&
                            <TouchableOpacity onPress={() => this.RestarProducto()} style={{ paddingLeft: 50, marginRight: 10 }}>
                                <IconMaterial color={"#55efc4"} name='minus-box-outline' size={25} />
                            </TouchableOpacity>}
                        {this.state.Cantidad > 0 &&
                            <Text style={{ fontWeight: 'bold' }} >{this.state.Cantidad}</Text>}
                        <TouchableOpacity onPress={() => this.AgregarProducto()} style={{ marginHorizontal: 10, paddingLeft: this.state.Cantidad > 0 ? 0 : 50 }}>
                            <IconMaterial color={"#55efc4"} name='plus-box-outline' size={25} />
                        </TouchableOpacity>
                    </View> :
                    <TouchableOpacity onPress={() => this.props.navigate('producto_detalle', { producto: this.props.producto, Cod_Mesa: this.props.Cod_Mesa })}
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