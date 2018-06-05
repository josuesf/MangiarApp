import { createStore } from 'redux'
import SocketIOClient from 'socket.io-client';
const reducer = (state, action) => {
    if (action.type === "ADD_PRODUCTO") {
        producto_detalles=[]
        if(action.producto_detalles) producto_detalles = action.producto_detalles
        var found = state.productos.find(p => {
            return (p.id_detalle === action.producto.id_detalle && p.cod_mesa == action.producto.cod_mesa && p.numero==state.Numero_Comprobante);
        });

        if (found) {
            return {
                ...state,
                productos: state.productos.filter(p => {
                    if (p.id_detalle == action.producto.id_detalle && p.cod_mesa == action.producto.cod_mesa && p.numero==state.Numero_Comprobante) {
                        p.cantidad = action.producto.cantidad
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
        if (action.producto.cantidad > 0) {
            return {
                ...state,
                productos: state.productos.filter(p => {
                    if (p.id_detalle == action.producto.id_detalle && p.cod_mesa == action.producto.cod_mesa && p.numero==state.Numero_Comprobante) {
                        p.cantidad = action.producto.cantidad
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
                    if (p.id_detalle == action.producto.id_detalle && p.cod_mesa == action.producto.cod_mesa && p.numero==state.Numero_Comprobante) {
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
                if (p.id_detalle == action.producto.id_detalle && p.cod_mesa == action.producto.cod_mesa && p.numero==state.Numero_Comprobante) {
                    return null
                }
                return p
            }),
            producto_detalles: state.producto_detalles.filter(p => {
                if (p.Id_Referencia == action.producto.id_detalle) {
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
            cod_mesa: action.cod_mesa,
            nombre_mesa: action.nombre_mesa,
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
            estado_accion:action.estado_accion
        }
    }
    if(action.type=="LIBERAR_MESA"){
        return {
            ...state,
            last_event: 'LIBERAR_MESA',
            productos:state.productos.filter(p=>p.numero!=action.numero),
            producto_detalles:state.producto_detalles.filter(p=>p.numero!=action.numero)
        }
    }
    if(action.type=="INIT_SOCKET"){
        return {
            ...state,
            last_event: 'INIT_SOCKET',
            socket: !state.socket?SocketIOClient(action.URL_WS):state.socket,
        }
    }
    return state
}
export default createStore(reducer,
    {
        // socket: SocketIOClient(GET_URL_WS()),
        productos: [],
        producto_detalles:[],
        last_event: '',
        last_producto: null,
        cod_mesa: '',
        id_usuario: undefined,
        nombre_usuario: undefined,
        tipo_usuario: undefined,
        nombre_mesa: undefined,
        Numero_Comprobante:'',
        Nro_Pedido:1,
        estado_accion:''
    })