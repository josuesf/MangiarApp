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
    Alert,
    ActivityIndicator,
    ScrollView,
} from 'react-native';
import { NavigationActions } from 'react-navigation'
import Icon from 'react-native-vector-icons/Ionicons';
import IconMaterial from 'react-native-vector-icons/MaterialCommunityIcons';
import IconFondation from 'react-native-vector-icons/Foundation'
const { width, height } = Dimensions.get('window')
import ProductoSeleccionado from '../components/ProductoSeleccionado'
import { URL_WS } from '../Constantes'
import store from '../store'
import CheckBox from '../components/CheckBox'
import RadioButton from '../components/RadioButton'
import MultipleBox from '../components/MultipleBox'

export default class ProductoDetalle extends Component<{}> {
    static navigationOptions = {
        title: 'Detalle',
        headerTintColor: '#55efc4',
        headerBackTitle: 'Atras',
        headerStyle: {
            backgroundColor: '#40407a',
        }

    };
    constructor() {
        super()
        console.ignoredYellowBox = [
            'Setting a timer'
        ];
        this.state = {
            cantidad: 1,
            total: 0,
            opciones: [],
            precios: []
            // opciones: [
            //     { producto_id: 245, nombre: 'Jarra de chicha morada', Precio: 3.00, cantidad: 1, combinacion_id: 'Elige Bebida', cantidad_minima: 0 },
            //     { producto_id: 246, nombre: 'Gaseosa personal Pepsi', Precio: 0.00, cantidad: 1, combinacion_id: 'Elige Bebida', cantidad_minima: 0 }]
        }
    }
    componentWillMount() {
        this.RecuperarPrecios()

    }
    RecuperarPrecios = () => {
        const { producto } = this.props.navigation.state.params
        this.setState({ buscando: true })
        const parametros = {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                producto_id: producto.producto_id
            })
        }
        fetch(URL_WS + '/ws/get_precios_producto', parametros)
            .then((response) => response.json())
            .then((data) => {
                console.log(data)
                if (!data.err) {
                    precios = data.precios.filter((p, i) => {
                        if (i == 0) { p.seleccionado = true }
                        return p
                    })
                    this.setState({
                        precios: precios
                    })
                    this.RecuperarOpcionales()
                }
            })
    }
    RecuperarOpcionales = () => {
        const { producto, cod_mesa } = this.props.navigation.state.params
        //this.setState({ buscando: true })
        const parametros = {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                producto_id: producto.producto_id
            })
        }
        fetch(URL_WS + '/ws/get_combinaciones_producto', parametros)
            .then((response) => response.json())
            .then((data) => {
                console.log(data)
                if (!data.err) {
                    var opciones = data.combinaciones.filter(c => {
                        c.valor_precio = parseFloat(c.valor_precio)
                        return c
                    })
                    if (opciones.length == 0 && this.state.precios.length == 0) {
                        var found = store.getState().productos.find(p => {
                            return (p.producto_id == producto.producto_id && p.cod_mesa == cod_mesa);
                        });
                        if (found) {
                            this.setState({ cantidad: parseInt(found.cantidad), total: parseFloat(producto.valor_precio) * found.cantidad, buscando: false })
                        } else
                            this.setState({ total: parseFloat(producto.valor_precio), buscando: false })
                    } else {
                        if (this.state.precios < 2)
                            this.setState({ total: parseFloat(producto.valor_precio), opciones, buscando: false })
                        else
                            this.setState({ total: parseFloat(this.state.precios.find(p => p.seleccionado == true).valor_precio), opciones, buscando: false })
                    }
                }

            })
    }
    componentDidMount() {
    }

    render() {
        const { navigate } = this.props.navigation;
        const { producto, cod_mesa } = this.props.navigation.state.params
        return (
            <View ref='ref_pedido' style={styles.container}>
                <StatusBar
                    backgroundColor="#2c2c54"
                    barStyle="default"
                />
                <ScrollView style={{ padding: 5 }}>
                    <Text style={{ color: '#57606f', fontWeight: "bold", marginVertical: 10 }} >{producto.nombre}</Text>
                    {this.state.buscando && <ActivityIndicator color="#333" size="large" style={{ alignSelf: 'center', paddingVertical: 10 }} />}
                    {this.state.precios.length > 1 &&
                        <View>
                            <Text style={{ color: '#95a5a6', fontWeight: 'bold' }} >Seleccione Precio: </Text>
                            {this.state.precios.map((p, i) =>
                                <RadioButton key={i}
                                    onPress={() => this.SeleccionarPrecio(p.cod_precio)}
                                    style={{ padding: 5 }}
                                    colorInactive={"#95a5a6"}
                                    value={p.seleccionado || false}
                                    textValue={p.nombre_precio}
                                    textPrecio={"S/." + parseFloat(p.valor_precio).toFixed(2)}
                                    colorActive={'#55efc4'}
                                    textStyle={{ color: '#95a5a6' }} />)}
                        </View>
                    }
                    {this.state.opciones.map((opc, index) =>
                        <View key={index}>
                            {(!this.state.opciones[index - 1] || (this.state.opciones[index - 1] && opc.combinacion_id != this.state.opciones[index - 1].combinacion_id))
                                && <Text style={{ color: '#95a5a6', fontWeight: 'bold' }}>{opc.etiqueta_titulo + (opc.cantidad_maxima > 2 ? ". Maximo " + opc.cantidad_maxima : "")}</Text>}
                            {opc.Error == true && <Text style={{ color: 'red', fontSize: 10 }}>Este campo es obligatorio</Text>}
                            {opc.cantidad_maxima == 0 &&
                                <RadioButton onPress={() => this.SeleccionarRadioButton(opc.detalle_id, opc.combinacion_id)}
                                    style={{ padding: 5 }}
                                    colorInactive={"#95a5a6"}
                                    value={opc.seleccionado || false}
                                    textValue={opc.nombre}
                                    textPrecio={"S/." + parseFloat(opc.valor_precio).toFixed(2)}
                                    colorActive={'#55efc4'}
                                    textStyle={{ color: '#95a5a6' }} />}
                            {opc.cantidad_maxima == 1 &&
                                <CheckBox onPress={() => this.SeleccionarCheck(opc.detalle_id)}
                                    style={{ padding: 5 }}
                                    colorInactive={"#95a5a6"}
                                    value={opc.seleccionado || false}
                                    textValue={opc.nombre}
                                    textPrecio={"S/." + parseFloat(opc.valor_precio).toFixed(2)}
                                    colorActive={'#55efc4'}
                                    textStyle={{ color: '#95a5a6' }} />
                            }
                            {opc.cantidad_maxima > 1 &&
                                <MultipleBox
                                    OnPressAgregarProducto={() => this.OnPressAgregarProducto(opc.detalle_id, opc.combinacion_id)}
                                    OnPresRestarProducto={() => this.OnPresRestarProducto(opc.detalle_id, opc.combinacion_id)}
                                    style={{ padding: 5 }}
                                    colorIcon={"#55efc4"}
                                    textValue={opc.nombre}
                                    textPrecio={"S/." + parseFloat(opc.valor_precio).toFixed(2)}
                                    Cantidad_Seleccionada={opc.cantidad || 0}
                                    textStyle={{ color: '#95a5a6' }}
                                    textCantidadColor={"#95a5a6"} />}
                        </View>

                    )}
                    <Text style={{ color: '#95a5a6', fontWeight: 'bold' }} >cantidad</Text>
                    <View style={{ flexDirection: 'row', borderWidth: 1, borderColor: '#55efc4', borderRadius: 5, marginVertical: 5, padding: 5, alignItems: 'center' }}>
                        <TouchableOpacity onPress={() => this.RestarProducto()} style={{ flex: 1 }}>
                            <IconMaterial color={"#55efc4"} name='minus-box-outline' size={30} />
                        </TouchableOpacity>
                        <Text style={{ fontWeight: 'bold', flex: 1, fontSize: 20 }} >{this.state.cantidad}</Text>
                        <TouchableOpacity onPress={() => this.AgregarProducto()} style={{}}>
                            <IconMaterial color={"#55efc4"} name='plus-box-outline' size={30} />
                        </TouchableOpacity>
                    </View>
                </ScrollView>
                {this.state.cantidad > 0 &&
                    <TouchableOpacity activeOpacity={0.9}
                        style={{
                            margin: 5, height: 50,
                            backgroundColor: '#00b894', borderRadius: 5, flexDirection: 'row', alignItems: 'center',
                            justifyContent: 'center'
                        }} onPress={() => this.ValidarDatos(producto, cod_mesa)}>
                        <Text style={{ color: '#f1f2f6', marginHorizontal: 10, flex: 1, fontWeight: 'bold' }}>({this.state.cantidad}) Agregar al pedido</Text>
                        <Text style={{ color: '#f1f2f6', marginHorizontal: 10, fontWeight: 'bold' }}>S./ {parseFloat(this.state.total).toFixed(2)}</Text>
                    </TouchableOpacity>}

            </View>
        );
    }
    OnPressAgregarProducto = (detalle_id, combinacion_id) => {
        var { producto, cod_mesa } = this.props.navigation.state.params
        const hay_precios = this.state.precios.length > 1
        opciones = this.state.opciones
        Cantidad_Actual = opciones.reduce((a, b) => a + ((b.cantidad && b.combinacion_id == combinacion_id) ? b.cantidad : 0), 0)
        this.setState({
            opciones: opciones.filter(v => {
                if (v.detalle_id == detalle_id && Cantidad_Actual < v.cantidad_maxima) {
                    v.seleccionado = true
                    v.cantidad = (!v.cantidad ? 0 : v.cantidad) + 1
                }
                return v
            })
        }, () => this.setState({
            total: this.state.cantidad * ((!hay_precios ? parseFloat(producto.valor_precio) : this.state.precios.reduce((a, b) => a + (b.seleccionado == true ? parseFloat(b.valor_precio) : 0), 0)) +
                this.state.opciones.reduce((a, b) => a + (b.seleccionado ? (b.cantidad * parseFloat(b.valor_precio)) : 0), 0))
        }))
    }
    OnPresRestarProducto = (detalle_id) => {
        var { producto, cod_mesa } = this.props.navigation.state.params
        const hay_precios = this.state.precios.length > 1
        opciones = this.state.opciones
        this.setState({
            opciones: opciones.filter(v => {
                if (v.detalle_id == detalle_id) {
                    v.cantidad = v.cantidad - 1
                }
                return v
            })
        }, () => this.setState({
            total: this.state.cantidad * ((!hay_precios ? parseFloat(producto.valor_precio) : this.state.precios.reduce((a, b) => a + (b.seleccionado == true ? parseFloat(b.valor_precio) : 0), 0)) +
                this.state.opciones.reduce((a, b) => a + (b.seleccionado ? (b.cantidad * parseFloat(b.valor_precio)) : 0), 0))
        }))
    }
    SeleccionarCheck = (detalle_id) => {
        // console.log(this.state.opciones.reduce((a, b) => a + (b.seleccionado ? (b.cantidad * parseFloat(b.valor_precio)) : 0), 0))
        var { producto, cod_mesa } = this.props.navigation.state.params
        const hay_precios = this.state.precios.length > 1
        opciones = this.state.opciones
        console.log(producto)
        this.setState({
            opciones: opciones.filter(v => {
                if (v.detalle_id == detalle_id) {
                    v.seleccionado = !v.seleccionado
                    v.cantidad = v.seleccionado ? 1 : 0
                }
                return v
            })
        }, () => this.setState({
            total: this.state.cantidad * ((!hay_precios ? parseFloat(producto.valor_precio) : this.state.precios.reduce((a, b) => a + (b.seleccionado == true ? parseFloat(b.valor_precio) : 0), 0)) +
                this.state.opciones.reduce((a, b) => a + (b.seleccionado ? (b.cantidad * parseFloat(b.valor_precio)) : 0), 0))
        }))
    }
    SeleccionarRadioButton = (detalle_id, combinacion_id) => {
        var { producto, cod_mesa } = this.props.navigation.state.params
        const hay_precios = this.state.precios.length > 1
        opciones = this.state.opciones
        this.setState({ opciones: [] }, () => {
            this.setState({
                opciones: opciones.filter(v => {
                    if (v.detalle_id == detalle_id && v.combinacion_id == combinacion_id) {
                        v.seleccionado = true
                        v.cantidad = 1
                    }
                    else if (v.detalle_id != detalle_id && v.combinacion_id == combinacion_id) {
                        v.seleccionado = false
                        v.cantidad = 0
                    }
                    return v
                })
            }, () => this.setState({
                total: this.state.cantidad * ((!hay_precios ? parseFloat(producto.valor_precio) : this.state.precios.reduce((a, b) => a + (b.seleccionado == true ? parseFloat(b.valor_precio) : 0), 0)) +
                    this.state.opciones.reduce((a, b) => a + (b.seleccionado ? (b.cantidad * parseFloat(parseFloat(b.valor_precio))) : 0), 0))
            }))
        })
    }
    SeleccionarPrecio = (cod_precio) => {
        var { producto, cod_mesa } = this.props.navigation.state.params
        const hay_precios = this.state.precios.length > 1
        precios = this.state.precios
        this.setState({
            precios: precios.filter(v => {
                if (v.cod_precio == cod_precio) {
                    v.seleccionado = true
                }
                else {
                    v.seleccionado = false
                }
                return v
            })
        }, () =>
                this.setState({
                    total: this.state.cantidad *
                        ((!hay_precios ? parseFloat(producto.valor_precio) : this.state.precios.reduce((a, b) => a + (b.seleccionado == true ? parseFloat(b.valor_precio) : 0), 0)) +
                            this.state.opciones.reduce((a, b) => a + (b.seleccionado ? (b.cantidad * parseFloat(b.valor_precio)) : 0), 0))
                }))

    }
    ValidarDatos = (producto, cod_mesa) => {
        const hay_precios = this.state.precios.length > 1
        const nombre_precio = hay_precios ? (' ' + this.state.precios.find(v => v.seleccionado == true).nombre_precio) : ''
        // let p = {
        //     Cod_Almacen: producto.Cod_Almacen,
        //     Cod_Marca: producto.Cod_Marca,
        //     Cod_Moneda: producto.Cod_Moneda,
        //     Cod_TipoOperatividad: producto.Cod_TipoOperatividad,
        //     cod_precio: producto.cod_precio,
        //     Cod_TipoProducto: producto.Cod_TipoProducto,
        //     Definicion: producto.Definicion,
        //     Des_CortaProducto: producto.Des_CortaProducto,
        //     Des_LargaProducto: producto.Des_LargaProducto,
        //     producto_id: producto.producto_id,
        //     Nom_Marca: producto.Nom_Marca,
        //     Nom_Moneda: producto.Nom_Moneda,
        //     nombre_precio: producto.nombre_precio,
        //     nombre: producto.nombre+nombre_precio,
        //     valor_precio: parseFloat(producto.valor_precio),
        //     Simbolo: producto.Simbolo,
        //     estado_detalle : 'PENDIENTE'
        // }
        let p = {
            //id_detalle : parseInt(producto.id_detalle + '' + store.getState().Nro_Pedido) + 1,
            // id_detalle:parseInt(producto.producto_id+''+(store.getState().Nro_Pedido+1)),
            id_detalle: cod_mesa + Date.now(),
            almacen_cod: producto.almacen_cod,
            cod_marca: producto.cod_marca,
            cod_moneda: producto.cod_moneda,
            producto_id: producto.producto_id,
            nombre: producto.nombre + nombre_precio,
            valor_precio: producto.valor_precio,
            simbolo: producto.simbolo,
            imagen_url: producto.imagen_url,
            estado_detalle: 'PENDIENTE'
        }
        // p=producto
        // p.nombre = producto.nombre+nombre_precio
        opciones = this.state.opciones.reverse()
        var cantidad_sel = 0
        this.setState({
            opciones: opciones.filter((o, i) => {

                if (o.seleccionado) {
                    cantidad_sel += o.cantidad
                }
                if (opciones[i + 1]) {
                    if (opciones[i + 1].combinacion_id != o.combinacion_id) {
                        o.Error = (cantidad_sel < o.cantidad_minima)
                        o.ErrorMensaje = (cantidad_sel < o.cantidad_minima) ? 'Seleccione minimo ' + o.cantidad_minima : ''
                        cantidad_sel = 0
                    }
                } else {
                    o.Error = cantidad_sel < o.cantidad_minima
                    o.ErrorMensaje = (cantidad_sel < o.cantidad_minima) ? 'Seleccione minimo ' + o.cantidad_minima : ''
                    cantidad_sel = 0
                }


                return o
            }).reverse()
        }, () => {
            //console.log(store.getState().productos[0].Id_Pedido)
            if (this.state.opciones.filter(o => o.Error == true).length == 0) {
                p.cantidad = this.state.cantidad
                p.cod_mesa = cod_mesa
                p.valor_precio = this.state.total / this.state.cantidad
                p.numero = store.getState().Numero_Comprobante

                if (this.state.opciones.length == 0 && !hay_precios) {
                    p.Id_Pedido = (p.producto_id).toString()
                    store.dispatch({
                        type: 'ADD_PRODUCTO',
                        producto: p,
                    })
                } else {
                    //console.log(store.getState().productos[0].Id_Pedido)
                    // var id_detalle = parseInt(p.producto_id + ''+store.getState().Nro_Pedido)
                    // var found = store.getState().productos.find(p => {
                    //     return (p.id_detalle === id_detalle);
                    // });
                    // p.id_detalle = found?id_detalle+1:id_detalle

                    p.id_referencia = 0
                    //console.log(store.getState().productos[0].Id_Pedido)
                    store.dispatch({
                        type: 'ADD_PRODUCTO',
                        producto: p,
                        producto_detalles: this.state.opciones.filter((o, i) => {
                            if (o.seleccionado == true && o.cantidad > 0) {
                                o.id_detalle = p.id_detalle.toString() + i
                                o.id_referencia = p.id_detalle.toString()
                                o.cod_mesa = cod_mesa
                                o.estado_detalle = 'PENDIENTE'
                                return o
                            }
                            else return null
                        })
                    })
                }

                this.props.navigation.goBack()
            }
        })
    }
    AgregarProducto = () => {
        var { producto } = this.props.navigation.state.params
        const hay_precios = this.state.precios.length > 0
        producto.cantidad = this.state.cantidad + 1
        this.setState({
            cantidad: producto.cantidad
        }, () => {
            this.setState({
                total: this.state.cantidad * ((!hay_precios ? parseFloat(producto.valor_precio) : this.state.precios.reduce((a, b) => a + (b.seleccionado == true ? parseFloat(b.valor_precio) : 0), 0)) +
                    this.state.opciones.reduce((a, b) => a + (b.seleccionado ? (b.cantidad * parseFloat(b.valor_precio)) : 0), 0))
            })
        })
    }
    RestarProducto = () => {
        const hay_precios = this.state.precios.length > 0
        if (parseInt(this.state.cantidad) > 1) {
            var { producto } = this.props.navigation.state.params
            producto.cantidad = this.state.cantidad - 1
            this.setState({
                cantidad: producto.cantidad
            }, () => {
                this.setState({
                    total: this.state.cantidad * ((!hay_precios ? parseFloat(producto.valor_precio) : this.state.precios.reduce((a, b) => a + (b.seleccionado == true ? parseFloat(b.valor_precio) : 0), 0)) +
                        this.state.opciones.reduce((a, b) => a + (b.seleccionado ? (b.cantidad * parseFloat(b.valor_precio)) : 0), 0))
                })
            })
        }
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFF',
    },
});