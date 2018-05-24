import React from 'react';
import {
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import IconMaterial from 'react-native-vector-icons/MaterialCommunityIcons';

export default CheckBox = (props) => (
    <TouchableOpacity onPress={props.onPress} activeOpacity={0.6} style={[{ flexDirection: 'row', alignItems: 'center' }, props.style]}>
        <View style={[{ flexDirection: 'row', alignItems: 'center',flex:1 }]}>
            <IconMaterial name={props.value ? "checkbox-marked" : "checkbox-blank-outline"}
                size={props.iconSize || 25}
                style={{ marginRight: 5 }}
                color={props.value ? props.colorActive : props.colorInactive} />
            <Text style={props.textStyle} >{props.textValue}</Text>
        </View>
        <Text style={props.textStyle} >{props.textPrecio}</Text>

    </TouchableOpacity>
)