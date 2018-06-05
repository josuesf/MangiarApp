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
import store from '../store'
const { width, height } = Dimensions.get('window')
const AVATAR_SIZE = 64
export default class Mesa extends Component {
    constructor(props) {
        super(props)
        this.state = {
            estado_accion: props.mesa.estado_accion,
            Nro_Cuentas: props.mesa.Nro_Cuentas,
            Mesero: props.mesa.Mesero,
            cod_mesa: props.mesa.cod_mesa,
        }
    }
    componentDidMount() {
        store.subscribe(() => {
            if (this.refs.ref_Mesa && store.getState().last_event == 'ADD_ESTADO_MESA' && store.getState().cod_mesa == this.props.mesa.cod_mesa) {
                this.setState({ estado_accion: store.getState().estado_accion })
            }
        })
    }
    render() {
        const ColorMesa = (estado_accion) => {
            if (estado_accion == 'LIBRE')
                return '#33d9b2'
            else if (estado_accion == 'PENDIENTE')
                return '#ffeaa7'
            else
                return '#ff7675'
        }
        return (
            <View style={{ alignItems: 'center', flexDirection: 'column' }}>

                <TouchableOpacity ref='ref_Mesa' activeOpacity={0.7} onPress={this.props.SeleccionarMesa} style={{
                    marginBottom: 10, height: this.props.width_state / 4 +10, width: this.props.width_state / 4+10,
                    justifyContent: 'center',
                    backgroundColor: ColorMesa(this.state.estado_accion), alignItems: 'center', borderColor: ColorMesa(this.state.estado_accion), borderWidth: 1,
                    borderRadius:10,marginRight: 20
                }}>
                    {this.state.Nro_Cuentas > 0 && <View style={{ backgroundColor: '#2c2c54', height: 20, width: 20, borderRadius: 10, alignItems: 'center' }}>
                        <Text style={{ color: '#FFF' }}>{this.state.Nro_Cuentas}</Text>
                    </View>}
                    <Text style={{ alignSelf: 'center', fontWeight: 'bold', color: '#2c2c54' }}>{this.props.mesa.nombre_mesa}</Text>
                    <Text style={{ fontSize: 8, color: '#2c2c54' }}>{this.state.Mesero}</Text>
                </TouchableOpacity>
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
        // borderRadius: 10,
        borderBottomWidth: 0.5,
        borderColor: '#eee',
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 3
    },

});