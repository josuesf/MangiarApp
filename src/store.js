import { createStore } from 'redux'
import SocketIOClient from 'socket.io-client';
import { URL_WS } from './Constantes';
const reducer = (state, action) => {
    if (action.type === "ADD_PRODUCTO") {
        producto_detalles=[]
        if(action.producto_detalles) producto_detalles = action.producto_detalles
        var found = state.productos.find(p => {
            return (p.Id_Detalle === action.producto.Id_Detalle && p.Cod_Mesa == action.producto.Cod_Mesa && p.Numero==state.Numero_Comprobante);
        });

        if (found) {
            return {
                ...state,
                productos: state.productos.filter(p => {
                    if (p.Id_Detalle == action.producto.Id_Detalle && p.Cod_Mesa == action.producto.Cod_Mesa && p.Numero==state.Numero_Comprobante) {
                        p.Cantidad = action.producto.Cantidad
                    }
                    return p
                }),
                last_event: 'ADD_PRODUCTO',
                last_producto: action.producto,
                Nro_Pedido:state.Nro_Pedido+1
            }
        } else {
            return {
                ...state,
                productos: state.productos.concat(action.producto),
                producto_detalles:state.producto_detalles.concat(producto_detalles),
                last_event: 'ADD_PRODUCTO',
                last_producto: action.producto,
                Nro_Pedido:state.Nro_Pedido+1
            }
        }

    }
    if (action.type === "RESTAR_PRODUCTO") {

        if (action.producto.Cantidad > 0) {
            return {
                ...state,
                productos: state.productos.filter(p => {
                    if (p.Id_Detalle == action.producto.Id_Detalle && p.Cod_Mesa == action.producto.Cod_Mesa && p.Numero==state.Numero_Comprobante) {
                        p.Cantidad = action.producto.Cantidad
                    }
                    return p
                }),
                last_event: 'RESTAR_PRODUCTO',
                last_producto: action.producto
            }
        } else {
            return {
                ...state,
                productos: state.productos.filter(p => {
                    if (p.Id_Detalle == action.producto.Id_Detalle && p.Cod_Mesa == action.producto.Cod_Mesa && p.Numero==state.Numero_Comprobante) {
                        return null
                    }
                    return p
                }),
                last_event: 'DELETE_PRODUCTO',
                last_producto: action.producto
            }
        }

    }
    if (action.type === "DELETE_PRODUCTO") {
        return {
            ...state,
            productos: state.productos.filter(p => {
                if (p.Id_Detalle == action.producto.Id_Detalle && p.Cod_Mesa == action.producto.Cod_Mesa && p.Numero==state.Numero_Comprobante) {
                    return null
                }
                return p
            }),
            producto_detalles: state.producto_detalles.filter(p => {
                if (p.Id_Referencia == action.producto.Id_Detalle) {
                    return null
                }
                return p
            }),
            last_event: 'DELETE_PRODUCTO',
            last_producto: action.producto
        }

    }
    if (action.type == "MESA_SELECCIONADA") {
        return {
            ...state,
            last_event: 'MESA_SELECCIONADA',
            Cod_Mesa: action.Cod_Mesa,
            Nom_Mesa: action.Nom_Mesa,
            tipo_usuario: action.tipo_usuario || state.tipo_usuario
        }
    }
    if (action.type == "LOGIN_USUARIO") {
        return {
            ...state,
            last_event: 'LOGIN_USUARIO',
            id_usuario: action.id_usuario,
            tipo_usuario: action.tipo_usuario,
            nombre_usuario: action.nombre_usuario
        }
    }
    if (action.type == "ADD_PRODUCTOS_SELECCIONADOS") {
        return {
            ...state,
            last_event: 'ADD_PRODUCTOS_SELECCIONADOS',
            productos: action.productos,
            producto_detalles:action.producto_detalles
        }
    }
    if (action.type == "ADD_NUMERO_COMPROBANTE") {
        return {
            ...state,
            last_event: 'ADD_NUMERO_COMPROBANTE',
            Numero_Comprobante: action.Numero_Comprobante,
        }
    }
    if (action.type == "ADD_ESTADO_MESA") {
        return {
            ...state,
            last_event: 'ADD_ESTADO_MESA',
            Estado_Mesa:action.Estado_Mesa
        }
    }
    if(action.type=="LIBERAR_MESA"){
        return {
            ...state,
            last_event: 'LIBERAR_MESA',
            productos:state.productos.filter(p=>p.Numero!=action.Numero),
            producto_detalles:state.producto_detalles.filter(p=>p.Numero!=action.Numero)
        }
    }
    return state
}
export default createStore(reducer,
    {
        socket: SocketIOClient(URL_WS),
        productos: [],
        producto_detalles:[],
        last_event: '',
        last_producto: null,
        Cod_Mesa: '',
        id_usuario: undefined,
        nombre_usuario: undefined,
        tipo_usuario: undefined,
        Nom_Mesa: undefined,
        Numero_Comprobante:'',
        Nro_Pedido:1,
        Estado_Mesa:''
    })