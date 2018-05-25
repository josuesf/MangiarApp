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
    Dimensions,
    Platform, Text,
    FlatList,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    Image,
} from 'react-native';
import { NavigationActions } from 'react-navigation'
import Icon from 'react-native-vector-icons/Ionicons';
import IconMaterial from 'react-native-vector-icons/MaterialCommunityIcons';
import IconFondation from 'react-native-vector-icons/Foundation'
import { ProgressDialog,Dialog } from 'react-native-simple-dialogs';
import Producto from '../components/Producto'
import store from '../store'
import { URL_WS } from '../Constantes'
const { width, height } = Dimensions.get('window')
export default class Home extends Component<{}> {
    static navigationOptions = {
        title: 'Productos',
        headerTintColor: '#55efc4',
        headerBackTitle: 'Atras',
        headerStyle: {
            backgroundColor: '#40407a',
        },
        header: null
    };
    constructor() {
        super()
        console.ignoredYellowBox = [
            'Setting a timer'
        ];
        this.state = {
            categorias_padre: [],
            categorias: [],
            cantidad_items: 0
        }
    }
    componentWillMount() {
        this.RecuperarCategorias_Todas()
        this.RecuperarProductos_Todos()
        this.CalcularTotal()
        console.log(store.getState().Numero_Comprobante)
        console.log(store.getState().productos)
    }
    componentDidMount() {
        store.subscribe(() => {
            if (this.refs.pedidos_ref)
                this.CalcularTotal()
        })
    }
    CalcularTotal = () => {
        productos = store.getState().productos.filter(p => p.cod_mesa == store.getState().cod_mesa && p.numero==store.getState().Numero_Comprobante)
        this.setState({
            total: productos.reduce((a, b) => a + (b.valor_precio * b.cantidad), 0),
            cantidad_items: productos.reduce((a, b) => a + (b.cantidad), 0),
        })

    }
    RecuperarCategorias_Todas = () => {
        this.setState({ productos: [] })
        const parametros = {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({})
        }
        fetch(URL_WS + '/ws/get_categorias_todas', parametros)
            .then((response) => response.json())
            .then((data) => {
                this.setState({
                    categorias: data.categorias
                })
            })
    }
    RecuperarProductos_Todos = () => {
        this.setState({ buscando: true, productos: [] })
        const parametros = {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({})
        }
        fetch(URL_WS + '/ws/get_productos_todos', parametros)
            .then((response) => response.json())
            .then((data) => {
                this.setState({ productos_todos: data.productos, buscando: false })
            })
    }
    SeleccionarCategoriaHija = (cod_categoria, Seleccionado) => {

        var categorias = this.state.categorias.filter(c => {
            if (c.cod_categoria == cod_categoria)
                c["Seleccionado"] = Seleccionado == 1 ? 0 : 1
            else
                c["Seleccionado"] = 0
            return c
        })
        this.setState({ categorias: [], productos: [] }, () => this.setState({ categorias: categorias, productos: this.state.productos_todos.filter(p => p.cod_categoria == cod_categoria) }))
    }
    NuevaCuenta=()=>{
        this.setState({OpcionesVisible:false})
        const nuevo = NavigationActions.back({
            key:'main',
          });
        store.dispatch({
            type: 'ADD_NUMERO_COMPROBANTE',
            Numero_Comprobante: '',
        })
        this.props.navigation.dispatch(nuevo)
    }
    render() {
        const { navigate,goBack } = this.props.navigation;
        return (
            <View style={styles.container}>
                <StatusBar
                    backgroundColor="#2c2c54"
                    barStyle="default"
                />
                <View style={{ height: 60, flexDirection: 'row', alignItems: 'center', backgroundColor: '#40407a', justifyContent: 'center' }}>
                    <TouchableOpacity onPress={()=>goBack()} style={{ paddingHorizontal: 10 }}>
                        <IconMaterial color={'#ffeaa7'} name='arrow-left' size={25} />
                    </TouchableOpacity>
                    <View style={{flex: 1, marginHorizontal: 10}}>
                        <Text style={{ color: '#ffeaa7', fontWeight: 'bold' }}>{store.getState().nombre_mesa}</Text>
                        <Text style={{ color: '#ffeaa7' }}>Cuenta {store.getState().Numero_Comprobante}</Text>
                    </View>
                    {store.getState().Numero_Comprobante!='' &&
                    <TouchableOpacity onPress={()=>this.setState({OpcionesVisible:true})} style={{ paddingHorizontal: 10 }}>
                        <IconMaterial color={'#ffeaa7'} name='dots-vertical' size={25} />
                    </TouchableOpacity>}
                </View>
                <ProgressDialog
                    activityIndicatorColor={"#9b59b6"}
                    activityIndicatorSize="large"
                    visible={this.state.buscando}
                    title="Buscando productos"
                    message="Por favor, espere..."
                />
                {/*<View style={{ backgroundColor: '#40407a' }}>
                    <ScrollView horizontal={true} >
                        {this.state.categorias_padre.map((c, index) =>
                            <TouchableOpacity onPress={() => this.SeleccionarCategoriaPadre(c.cod_categoria)}
                                activeOpacity={0.7} style={{ backgroundColor: '#40407a', marginRight: 1 }} key={c.cod_categoria}>
                                <Text style={{ color: c.Seleccionado == 1 ? '#55efc4' : '#95a5a6', paddingHorizontal: 5, paddingVertical: 10 }}>{c.nombre_categoria}</Text>
                            </TouchableOpacity>
                        )}
                    </ScrollView>
                </View>*/}
                <View style={{ backgroundColor: '#FFF', flex: 1 }}>

                    <ScrollView  >
                        {this.state.categorias.map((c, index) =>
                            <View key={c.cod_categoria}>
                                <TouchableOpacity onPress={() => this.SeleccionarCategoriaHija(c.cod_categoria, c.Seleccionado)}
                                    activeOpacity={0.7} style={{ backgroundColor: '#FFF', flexDirection: 'row', alignItems: 'center', marginRight: 1,marginVertical:10 }}>
                                    {/* <Image source={{uri:URL_WS+'/images/'+c.imagen_url}}  style={{height:60,width:60,borderRadius:5,marginHorizontal:5}}/> */}
                                    <Text style={{ color: c.Seleccionado == 1 ? '#1abc9c' : '#95a5a6', flex: 1, fontWeight: 'bold', paddingHorizontal: 5, marginLeft: 10, paddingVertical: 10 }}>{c.nombre_categoria}</Text>
                                    <IconMaterial
                                        name={c.Seleccionado != 1 ? 'chevron-down' : 'chevron-up'}
                                        size={25} style={{ marginHorizontal: 10 }}
                                        color={c.Seleccionado == 1 ? '#1abc9c' : '#95a5a6'}
                                    />

                                </TouchableOpacity>
                                {c.Seleccionado == 1 &&
                                    <View>
                                        {this.state.buscando && <ActivityIndicator color="#333" size="large" style={{ alignSelf: 'center', paddingVertical: 10 }} />
                                        }

                                        <FlatList
                                            data={this.state.productos}
                                            renderItem={({ item }) => (
                                                <Producto producto={item} cod_mesa={store.getState().cod_mesa} navigate={navigate} />
                                            )}
                                            keyExtractor={(item, index) => index}
                                        />
                                    </View>}
                            </View>

                        )}
                    </ScrollView>
                    <View ref="pedidos_ref" >
                        {parseFloat(this.state.total) > 0 &&
                            <TouchableOpacity activeOpacity={0.8} onPress={() => navigate('pedido')}
                                style={{
                                    height: 50, backgroundColor: '#40407a',
                                    borderRadius: 5, marginHorizontal: 10, marginBottom: 10,
                                    flexDirection: 'row', alignItems: 'center'
                                }}>
                                <View style={{ flexDirection: 'row', flex: 1, alignItems: 'center', marginHorizontal: 10 }}>
                                    <Text style={{ fontWeight: 'bold', color: '#55efc4' }}>Ver Items ({this.state.cantidad_items})</Text>
                                </View>

                                <Text style={{ marginHorizontal: 10, fontWeight: 'bold', color: '#55efc4' }}>Total {(this.state.total).toFixed(2)}</Text>
                            </TouchableOpacity>
                        }
                    </View>
                </View>
                <Dialog
                    visible={this.state.OpcionesVisible}
                    onTouchOutside={() => this.setState({ OpcionesVisible: false })} >
                    <View>
                        <TouchableOpacity activeOpacity={0.5} onPress={this.NuevaCuenta}
                            style={{ marginVertical: 10, backgroundColor: '#fff' }}>
                            <Text style={{ fontWeight: 'bold', color: 'gray' }}>Crear nueva cuenta</Text>
                        </TouchableOpacity>
                    </View>
                </Dialog>             


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