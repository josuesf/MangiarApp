import React from 'react';
import {
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import IconMaterial from 'react-native-vector-icons/MaterialCommunityIcons';

export default MultipleBox = (props) => (
    <TouchableOpacity onPress={props.OnPressAgregarProducto} activeOpacity={0.6} style={[{ flexDirection: 'row', alignItems: 'center' }, props.style]}>
        {props.Cantidad_Seleccionada > 0 &&
            <TouchableOpacity onPress={props.OnPresRestarProducto} style={{ marginRight: 10 }}>
                <IconMaterial color={props.colorIcon} name='minus-box-outline' size={25} />
            </TouchableOpacity>}
        {props.Cantidad_Seleccionada > 0 &&
            <Text style={{ fontWeight: 'bold',marginRight:10,color:props.textCantidadColor }} >{props.Cantidad_Seleccionada}</Text>}


        <TouchableOpacity onPress={props.OnPressAgregarProducto} >
            <IconMaterial color={props.colorIcon} name='plus-box-outline' size={25} />
        </TouchableOpacity>
        <View style={[{ flexDirection: 'row', alignItems: 'center', flex: 1 }]}>

            <Text style={[{ marginLeft: 5 }, props.textStyle]} >{props.textValue}</Text>
        </View>
        <Text style={props.textStyle} >{props.textPrecio}</Text>
        


    </TouchableOpacity>
)