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
            Cantidad: 1,
            Total: 0,
            Opciones: [],
            precios: []
            // Opciones: [
            //     { Id_Producto: 245, Nom_Producto: 'Jarra de chicha morada', Precio: 3.00, Cantidad: 1, Cod_TipoDetalle: 'Elige Bebida', ValorMinimo: 0 },
            //     { Id_Producto: 246, Nom_Producto: 'Gaseosa personal Pepsi', Precio: 0.00, Cantidad: 1, Cod_TipoDetalle: 'Elige Bebida', ValorMinimo: 0 }]
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
                Id_Producto: producto.Id_Producto
            })
        }
        fetch(URL_WS + '/get_precios_producto', parametros)
            .then((response) => response.json())
            .then((data) => {
                precios = data.precios.filter((p, i) => {
                    if (i == 0) p.Seleccionado = true
                    return p
                })
                this.setState({
                    precios: precios
                })
                this.RecuperarOpcionales()
            })
    }
    RecuperarOpcionales = () => {
        const { producto, Cod_Mesa } = this.props.navigation.state.params
        //this.setState({ buscando: true })
        const parametros = {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                Id_Producto: producto.Id_Producto
            })
        }
        fetch(URL_WS + '/get_detalle_producto', parametros)
            .then((response) => response.json())
            .then((data) => {
                if (data.respuesta == 'ok') {
                    var Opciones = data.productos_detalle
                    if (Opciones.length == 0 && this.state.precios.length==0) {
                        var found = store.getState().productos.find(p => {
                            return (p.Id_Producto == producto.Id_Producto && p.Cod_Mesa == Cod_Mesa);
                        });
                        if (found) {
                            this.setState({ Cantidad: parseInt(found.Cantidad), Total: producto.PrecioUnitario * found.Cantidad, buscando: false })
                        } else
                            this.setState({ Total: producto.PrecioUnitario, buscando: false })
                    } else {
                        this.setState({ Total: producto.PrecioUnitario, Opciones, buscando: false })
                    }
                }

            })
    }
    componentDidMount() {
    }

    render() {
        const { navigate } = this.props.navigation;
        const { producto, Cod_Mesa } = this.props.navigation.state.params
        return (
            <View ref='ref_pedido' style={styles.container}>
                <StatusBar
                    backgroundColor="#2c2c54"
                    barStyle="default"
                />
                <ScrollView style={{ padding: 5 }}>
                    <Text style={{ color: '#57606f', fontWeight: "bold", marginVertical: 10 }} >{producto.Nom_Producto}</Text>
                    {this.state.buscando && <ActivityIndicator color="#333" size="large" style={{ alignSelf: 'center', paddingVertical: 10 }} />}
                    {this.state.precios.length > 0 &&
                        <View>
                            <Text style={{ color: '#95a5a6', fontWeight: 'bold' }} >Seleccione Precio: </Text>
                            {this.state.precios.map((p, i) =>
                                <RadioButton key={i}
                                    onPress={() => this.SeleccionarPrecio(p.Cod_TipoPrecio)}
                                    style={{ padding: 5 }}
                                    colorInactive={"#95a5a6"}
                                    value={p.Seleccionado || false}
                                    textValue={p.Nom_Precio}
                                    textPrecio={"S/." + p.PrecioUnitario.toFixed(2)}
                                    colorActive={'#55efc4'}
                                    textStyle={{ color: '#95a5a6' }} />)}
                        </View>
                    }
                    {this.state.Opciones.map((opc, index) =>
                        <View key={index}>
                            {(!this.state.Opciones[index - 1] || (this.state.Opciones[index - 1] && opc.Cod_TipoDetalle != this.state.Opciones[index - 1].Cod_TipoDetalle))
                                && <Text style={{ color: '#95a5a6', fontWeight: 'bold' }}>{opc.Cod_TipoDetalle + (opc.CantidadMax_Grupo > 2 ? ". Maximo " + opc.CantidadMax_Grupo : "")}</Text>}
                            {opc.Error == true && <Text style={{ color: 'red', fontSize: 10 }}>Este campo es obligatorio</Text>}
                            {opc.CantidadMax_Grupo == 0 &&
                                <RadioButton onPress={() => this.SeleccionarRadioButton(opc.Item_Detalle, opc.Cod_TipoDetalle)}
                                    style={{ padding: 5 }}
                                    colorInactive={"#95a5a6"}
                                    value={opc.Seleccionado || false}
                                    textValue={opc.Nom_Producto}
                                    textPrecio={"S/." + opc.PrecioUnitario.toFixed(2)}
                                    colorActive={'#55efc4'}
                                    textStyle={{ color: '#95a5a6' }} />}
                            {opc.CantidadMax_Grupo == 1 &&
                                <CheckBox onPress={() => this.SeleccionarCheck(opc.Item_Detalle)}
                                    style={{ padding: 5 }}
                                    colorInactive={"#95a5a6"}
                                    value={opc.Seleccionado || false}
                                    textValue={opc.Nom_Producto}
                                    textPrecio={"S/." + opc.PrecioUnitario.toFixed(2)}
                                    colorActive={'#55efc4'}
                                    textStyle={{ color: '#95a5a6' }} />
                            }
                            {opc.CantidadMax_Grupo > 1 &&
                                <MultipleBox
                                    OnPressAgregarProducto={() => this.OnPressAgregarProducto(opc.Item_Detalle, opc.Cod_TipoDetalle)}
                                    OnPresRestarProducto={() => this.OnPresRestarProducto(opc.Item_Detalle, opc.Cod_TipoDetalle)}
                                    style={{ padding: 5 }}
                                    colorIcon={"#55efc4"}
                                    textValue={opc.Nom_Producto}
                                    textPrecio={"S/." + opc.PrecioUnitario.toFixed(2)}
                                    Cantidad_Seleccionada={opc.Cantidad || 0}
                                    textStyle={{ color: '#95a5a6' }}
                                    textCantidadColor={"#95a5a6"} />}
                        </View>

                    )}
                    <Text style={{ color: '#95a5a6', fontWeight: 'bold' }} >Cantidad</Text>
                    <View style={{ flexDirection: 'row', borderWidth: 1, borderColor: '#55efc4', borderRadius: 5, marginVertical: 5, padding: 5, alignItems: 'center' }}>
                        <TouchableOpacity onPress={() => this.RestarProducto()} style={{ flex: 1 }}>
                            <IconMaterial color={"#55efc4"} name='minus-box-outline' size={30} />
                        </TouchableOpacity>
                        <Text style={{ fontWeight: 'bold', flex: 1, fontSize: 20 }} >{this.state.Cantidad}</Text>
                        <TouchableOpacity onPress={() => this.AgregarProducto()} style={{}}>
                            <IconMaterial color={"#55efc4"} name='plus-box-outline' size={30} />
                        </TouchableOpacity>
                    </View>
                </ScrollView>
                {this.state.Cantidad > 0 &&
                    <TouchableOpacity activeOpacity={0.9}
                        style={{
                            margin: 5, height: 50,
                            backgroundColor: '#00b894', borderRadius: 5, flexDirection: 'row', alignItems: 'center',
                            justifyContent: 'center'
                        }} onPress={() => this.ValidarDatos(producto, Cod_Mesa)}>
                        <Text style={{ color: '#f1f2f6', marginHorizontal: 10, flex: 1, fontWeight: 'bold' }}>({this.state.Cantidad}) Agregar al pedido</Text>
                        <Text style={{ color: '#f1f2f6', marginHorizontal: 10, fontWeight: 'bold' }}>S./ {this.state.Total.toFixed(2)}</Text>
                    </TouchableOpacity>}

            </View>
        );
    }
    OnPressAgregarProducto = (Item_Detalle, Cod_TipoDetalle) => {
        var { producto, Cod_Mesa } = this.props.navigation.state.params
        const hay_precios = this.state.precios.length > 0
        Opciones = this.state.Opciones
        Cantidad_Actual = Opciones.reduce((a, b) => a + ((b.Cantidad && b.Cod_TipoDetalle == Cod_TipoDetalle) ? b.Cantidad : 0), 0)
        this.setState({
            Opciones: Opciones.filter(v => {
                if (v.Item_Detalle == Item_Detalle && Cantidad_Actual < v.CantidadMax_Grupo) {
                    v.Seleccionado = true
                    v.Cantidad = (!v.Cantidad ? 0 : v.Cantidad) + 1
                }
                return v
            })
        }, () => this.setState({
            Total: this.state.Cantidad * ( (!hay_precios ? producto.PrecioUnitario : this.state.precios.reduce((a, b) => a + (b.Seleccionado == true ? b.PrecioUnitario : 0), 0)) +
                this.state.Opciones.reduce((a, b) => a + (b.Seleccionado ? (b.Cantidad * b.PrecioUnitario) : 0), 0))
        }))
    }
    OnPresRestarProducto = (Item_Detalle) => {
        var { producto, Cod_Mesa } = this.props.navigation.state.params
        const hay_precios = this.state.precios.length > 0
        Opciones = this.state.Opciones
        this.setState({
            Opciones: Opciones.filter(v => {
                if (v.Item_Detalle == Item_Detalle) {
                    v.Cantidad = v.Cantidad - 1
                }
                return v
            })
        }, () => this.setState({
            Total: this.state.Cantidad * ( (!hay_precios ? producto.PrecioUnitario : this.state.precios.reduce((a, b) => a + (b.Seleccionado == true ? b.PrecioUnitario : 0), 0)) +
                this.state.Opciones.reduce((a, b) => a + (b.Seleccionado ? (b.Cantidad * b.PrecioUnitario) : 0), 0))
        }))
    }
    SeleccionarCheck = (Item_Detalle) => {
        var { producto, Cod_Mesa } = this.props.navigation.state.params
        const hay_precios = this.state.precios.length > 0
        Opciones = this.state.Opciones
        this.setState({
            Opciones: Opciones.filter(v => {
                if (v.Item_Detalle == Item_Detalle) {
                    v.Seleccionado = !v.Seleccionado
                    v.Cantidad = v.Seleccionado ? 1 : 0
                }
                return v
            })
        }, () => this.setState({
            Total: this.state.Cantidad * ((!hay_precios ? producto.PrecioUnitario : this.state.precios.reduce((a, b) => a + (b.Seleccionado == true ? b.PrecioUnitario : 0), 0)) +
                this.state.Opciones.reduce((a, b) => a + (b.Seleccionado ? (b.Cantidad * b.PrecioUnitario) : 0), 0))
        }))
    }
    SeleccionarRadioButton = (Item_Detalle, Cod_TipoDetalle) => {
        var { producto, Cod_Mesa } = this.props.navigation.state.params
        const hay_precios = this.state.precios.length > 0
        Opciones = this.state.Opciones
        this.setState({ Opciones: [] }, () => {
            this.setState({
                Opciones: Opciones.filter(v => {
                    if (v.Item_Detalle == Item_Detalle && v.Cod_TipoDetalle == Cod_TipoDetalle) {
                        v.Seleccionado = true
                        v.Cantidad = 1
                    }
                    else if (v.Item_Detalle != Item_Detalle && v.Cod_TipoDetalle == Cod_TipoDetalle) {
                        v.Seleccionado = false
                        v.Cantidad = 0
                    }
                    return v
                })
            }, () => this.setState({
                Total: this.state.Cantidad * ((!hay_precios ? producto.PrecioUnitario : this.state.precios.reduce((a, b) => a + (b.Seleccionado == true ? b.PrecioUnitario : 0), 0)) +
                     this.state.Opciones.reduce((a, b) => a + (b.Seleccionado ? (b.Cantidad * b.PrecioUnitario) : 0), 0))
            }))
        })
    }
    SeleccionarPrecio = (Cod_TipoPrecio) => {
        var { producto, Cod_Mesa } = this.props.navigation.state.params
        const hay_precios = this.state.precios.length > 0
        precios = this.state.precios
        this.setState({
            precios: precios.filter(v => {
                if (v.Cod_TipoPrecio == Cod_TipoPrecio) {
                    v.Seleccionado = true
                }
                else {
                    v.Seleccionado = false
                }
                return v
            })
        }, () =>
                this.setState({
                    Total: this.state.Cantidad *
                        ((!hay_precios ? producto.PrecioUnitario : this.state.precios.reduce((a, b) => a + (b.Seleccionado == true ? b.PrecioUnitario : 0), 0)) +
                            this.state.Opciones.reduce((a, b) => a + (b.Seleccionado ? (b.Cantidad * b.PrecioUnitario) : 0), 0))
                }))

    }
    ValidarDatos = (producto, Cod_Mesa) => {
        const hay_precios = this.state.precios.length > 0
        const Nom_Precio = hay_precios ? (' ' + this.state.precios.find(v => v.Seleccionado == true).Nom_Precio) : ''
        let p = {
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
            Nom_Producto: producto.Nom_Producto+Nom_Precio,
            PrecioUnitario: producto.PrecioUnitario,
            Simbolo: producto.Simbolo,
            Estado_Pedido : 'PENDIENTE'
        }
        // p=producto
        //console.log(store.getState().productos[0].Id_Pedido)
        Opciones = this.state.Opciones.reverse()
        var cantidad_sel = 0
        this.setState({
            Opciones: Opciones.filter((o, i) => {

                if (o.Seleccionado) {
                    cantidad_sel += o.Cantidad
                }
                if (Opciones[i + 1]) {
                    if (Opciones[i + 1].Cod_TipoDetalle != o.Cod_TipoDetalle) {
                        o.Error = (cantidad_sel < o.ValorMinimo)
                        o.ErrorMensaje = (cantidad_sel < o.ValorMinimo)?'Seleccione minimo '+o.ValorMinimo:''
                        cantidad_sel = 0
                    }
                } else {
                    o.Error = cantidad_sel < o.ValorMinimo
                    o.ErrorMensaje = (cantidad_sel < o.ValorMinimo)?'Seleccione minimo '+o.ValorMinimo:''
                    cantidad_sel = 0
                }


                return o
            }).reverse()
        }, () => {
            //console.log(store.getState().productos[0].Id_Pedido)
            if (this.state.Opciones.filter(o => o.Error == true).length == 0) {
                p.Cantidad = this.state.Cantidad
                p.Cod_Mesa = Cod_Mesa
                p.PrecioUnitario = this.state.Total / this.state.Cantidad
                p.Numero =store.getState().Numero_Comprobante

                if (this.state.Opciones.length == 0 && !hay_precios) {
                    p.Id_Pedido = (p.Id_Producto).toString()
                    store.dispatch({
                        type: 'ADD_PRODUCTO',
                        producto: p,
                    })
                } else {
                    //console.log(store.getState().productos[0].Id_Pedido)
                    var Id_Detalle = parseInt(p.Id_Producto + ''+store.getState().Nro_Pedido)
                    var found = store.getState().productos.find(p => {
                        return (p.Id_Detalle === Id_Detalle);
                    });
                    p.Id_Detalle = found?Id_Detalle+1:Id_Detalle
                    p.Id_Referencia = 0
                    //console.log(store.getState().productos[0].Id_Pedido)
                    store.dispatch({
                        type: 'ADD_PRODUCTO',
                        producto: p,
                        producto_detalles: this.state.Opciones.filter((o,i) => {
                            if (o.Seleccionado == true && o.Cantidad>0) {
                                o.Id_Detalle = p.Id_Detalle.toString()+i
                                o.Id_Referencia = p.Id_Detalle
                                o.Cod_Mesa =  Cod_Mesa
                                o.Estado_Pedido = 'PENDIENTE'
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
        producto.Cantidad = this.state.Cantidad + 1
        this.setState({
            Cantidad: producto.Cantidad
        }, () => {
            this.setState({
                Total: this.state.Cantidad * ((!hay_precios ? producto.PrecioUnitario : this.state.precios.reduce((a, b) => a + (b.Seleccionado == true ? b.PrecioUnitario : 0), 0)) +
                    this.state.Opciones.reduce((a, b) => a + (b.Seleccionado ? (b.Cantidad * b.PrecioUnitario) : 0), 0))
            })
        })
    }
    RestarProducto = () => {
        const hay_precios = this.state.precios.length > 0
        if (parseInt(this.state.Cantidad) > 1) {
            var { producto } = this.props.navigation.state.params
            producto.Cantidad = this.state.Cantidad - 1
            this.setState({
                Cantidad: producto.Cantidad
            }, () => {
                this.setState({
                    Total: this.state.Cantidad * ((!hay_precios ? producto.PrecioUnitario : this.state.precios.reduce((a, b) => a + (b.Seleccionado == true ? b.PrecioUnitario : 0), 0)) +
                        this.state.Opciones.reduce((a, b) => a + (b.Seleccionado ? (b.Cantidad * b.PrecioUnitario) : 0), 0))
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