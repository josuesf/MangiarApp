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
import { ConfirmDialog } from 'react-native-simple-dialogs';


const { width, height } = Dimensions.get('window')
const AVATAR_SIZE = 50
export default class ProductoSeleccionado extends Component {
    constructor(props) {
        super(props)
        this.state = {
            cantidad: this.props.producto.cantidad,
            producto_detalles: store.getState().producto_detalles.filter(p => p.id_referencia == this.props.producto.id_detalle)
        }
    }

    AgregarProducto = () => {
        var producto = this.props.producto
        producto.cantidad = this.state.cantidad + 1
        this.setState({
            cantidad: producto.cantidad
        }, () => {
            store.dispatch({
                type: 'ADD_PRODUCTO',
                producto: producto,
            })
        })
    }
    RestarProducto = () => {
        if (parseInt(this.state.cantidad) > 0) {
            var producto = this.props.producto
            producto.cantidad = this.state.cantidad - 1
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
    BorrarProducto = () => {
        store.dispatch({
            type: 'DELETE_PRODUCTO',
            producto: this.props.producto,
        })
        this.setState({ preguntaEliminar: false })
    }
    render() {
        const moneda = 'S/. '
        const { producto_detalles } = this.state
        return (
            <View ref="root" style={styles.container}>
                <View style={{ flexDirection: 'row', flex: 4, alignItems: 'center' }}>

                    <Image
                        source={{ uri: URL_WS+'/images/'+this.props.producto.imagen_url }}
                        //source={require('../images/plato_default.png')}
                        style={{
                            marginLeft: 10,
                            width: AVATAR_SIZE, height: AVATAR_SIZE
                            ,borderRadius:10
                        }} />

                    <View style={{ flexDirection: 'column', marginHorizontal: 10, }}>
                        <View style={{ alignItems: 'center', flexDirection: 'row' }}>
                            {this.props.producto.estado_detalle =='CONFIRMA' && <Text style={{ fontSize: 15, fontWeight: 'bold', color: '#95a5a6' }} >{this.state.cantidad+" "}</Text>}
                            <Text style={{ color: '#95a5a6', fontWeight: 'bold' }}>{this.props.producto.nombre}</Text>
                            <Text style={{ color: '#95a5a6', fontSize: 0, marginLeft: 2 }}>{moneda + (parseFloat(this.props.producto.valor_precio)).toFixed(2)}</Text>
                        </View>

                        {this.state.producto_detalles.map((p, index) => <Text key={index} style={{ color: '#95a5a6', fontSize: 12 }} >{p.cantidad + " " + p.nombre + " S./" + parseFloat(p.valor_precio).toFixed(2)}</Text>)}


                        {this.props.producto.estado_detalle !='CONFIRMA' && <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            {parseInt(this.props.producto.cantidad) > 1 &&
                                <TouchableOpacity onPress={() => this.RestarProducto()} style={{ marginRight: 10 }}>
                                    <IconMaterial color={"#00b894"} name='minus-box-outline' size={30} />
                                </TouchableOpacity>
                            }

                            <Text style={{ fontSize: 15, fontWeight: 'bold', color: '#95a5a6' }} >{this.state.cantidad}</Text>
                            <TouchableOpacity onPress={() => this.AgregarProducto()} style={{ marginLeft: 10 }}>
                                <IconMaterial color={"#00b894"} name='plus-box-outline' size={30} />
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => this.setState({ preguntaEliminar: true })} style={{ marginLeft: 10 }}>
                                <IconMaterial color="#95a5a6" name='delete' size={30} />
                            </TouchableOpacity>
                        </View>}
                    </View>


                </View>
                <View style={{ flex: 1, paddingRight: 5, paddingLeft: 50 }}>
                    <Text style={{ fontWeight: 'bold', color: '#95a5a6' }}>

                        {moneda +
                            (parseFloat(this.props.producto.valor_precio) * parseFloat(this.props.producto.cantidad)).toFixed(2)
                        }
                    </Text>
                </View>

                <ConfirmDialog
                    title="Quitar producto"
                    message="Esta seguro de quitar este producto de tu orden?"
                    visible={this.state.preguntaEliminar}
                    onTouchOutside={() => this.setState({ preguntaEliminar: false })}
                    positiveButton={{
                        title: "SI",
                        onPress: () => this.BorrarProducto()
                    }}
                    negativeButton={{
                        title: "NO",
                        onPress: () => this.setState({ preguntaEliminar: false })
                    }}
                />

            </View>
        );

    }
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: 'white',
        // shadowColor: 'black',
        // shadowOpacity: .2,
        // elevation: 2,
        // marginVertical: 2,
        //borderRadius: 10,
        borderBottomWidth: 0.5,
        borderColor: '#eee',
        flexDirection: 'row',
        paddingBottom: 10

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