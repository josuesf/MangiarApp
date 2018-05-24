/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React, { Component } from 'react';
import {
    StyleSheet,
    View,
    Text,
    TouchableOpacity,
    TextInput,
    Picker,
    ActivityIndicator,
    ScrollView,
} from 'react-native';

export default class BusquedaDoc extends Component<{}> {
    constructor() {
        super()
        this.state = {
            TipoDoc:'DNI',
        }
    }

    componentWillMount() {
    }

    IniciarSesion = () => {
        this.setState({ cargando: true })
        const parametros = {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                usuario: this.state.usuario,
                password: this.state.password
            })
        }
        fetch(URL_WS + '/login_personal', parametros)
            .then((response) => response.json())
            .then((data) => {
                this.setState({ cargando: false })
                if (data.respuesta == 'ok') {
                    store.dispatch({
                        type: 'LOGIN_USUARIO',
                        id_usuario: data.usuario.Cod_Usuarios,
                        nombre_usuario: data.usuario.Nick,
                        tipo_usuario: 'EMPLEADO'
                    })
                    const vista_mesas = NavigationActions.reset({
                        index: 0,
                        actions: [
                            NavigationActions.navigate({ routeName: 'mesas' })
                        ]
                    })
                    this.props.navigation.dispatch(vista_mesas)

                } else {
                    Alert.alert('Error', 'Ocurrio un error vuelva a intentarlo')

                }

            }).catch(err => {
                this.setState({ cargando: false })
                Alert.alert('Error', err.toString())
            })
    }
    CambioNroDoc=(Nro_Doc)=>{
        console.log(this.state.TipoDoc)
        if(this.state.TipoDoc=="RUC"){
            if(Nro_Doc.length==11){
                alert(Nro_Doc)
            }
        }else{
            if(Nro_Doc.length==8){

            }
        }
        this.setState({Nro_Doc})
    }
    render() {
        return (
            <ScrollView keyboardShouldPersistTaps='handled'>
                <Text>Tipo Documento</Text>
                <Picker
                    selectedValue={this.state.TipoDoc}
                    onValueChange={(itemValue, itemIndex) => this.setState({ TipoDoc: itemValue })}>
                    <Picker.Item label="DNI" value="DNI" />
                    <Picker.Item label="RUC" value="RUC" />
                </Picker>
                <TextInput onChangeText={(text)=>this. CambioNroDoc(text)} value={this.state.Nro_Doc} placeholder="Nro Documento" style={styles.input} underlineColorAndroid="transparent"/>
                <TextInput onChangeText={(text)=>this.setState({Nombre:text})} value={this.state.Nombre} placeholder="Razon Social/Nombre" style={styles.input} underlineColorAndroid="transparent"/>
                <TextInput onChangeText={(text)=>this.setState({Direccion:text})} value={this.state.Direccion} placeholder="Direccion" style={styles.input} underlineColorAndroid="transparent"/>
                <TextInput onChangeText={(text)=>this.setState({Correo:text})} value={this.state.Correo} placeholder="Correo" style={styles.input} underlineColorAndroid="transparent"/>
                <TextInput onChangeText={(text)=>this.setState({Telefono:text})} value={this.state.Telefono} placeholder="Telefono o Cel." style={styles.input} underlineColorAndroid="transparent"/>
                <TouchableOpacity activeOpacity={0.7} style={{ backgroundColor: '#FAAD83', borderRadius: 5, marginVertical: 5 }}>
                    <Text style={{ color: '#FFF', alignSelf: 'center', paddingVertical: 10 }}>Guardar</Text>
                </TouchableOpacity>
            </ScrollView>
        );
    }

}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    input:{marginVertical:5,borderWidth:1,borderRadius:5,padding:10}
});