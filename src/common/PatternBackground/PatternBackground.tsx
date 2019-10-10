import React, { PureComponent } from 'react';
import { ImageBackground, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

interface IPatternBackgroundProps {
  pattern?: string;
  contentContainerStyle?: StyleProp<ViewStyle>;
  isCentered?: boolean;
}

export default class PatternBackground extends PureComponent<IPatternBackgroundProps> {
  render() {
    const { contentContainerStyle, children, pattern, isCentered } = this.props;

    return (
      <View style={[styles.root, contentContainerStyle]}>
        <ImageBackground
          source={pattern || require('../../images/mosaic.png')}
          resizeMode="cover"
          style={{ flex: 1, backgroundColor: 'transparent' }}
        >
          <LinearGradient
            colors={['rgba(255, 255, 255, 1)', 'rgba(255, 255, 255, 0.8)', 'rgba(255, 255, 255, 1)']}
            locations={[0.175, 0.48, 0.77]}
            style={[{ flex: 1 }, isCentered && styles.container]}
          >
            {children}
          </LinearGradient>
        </ImageBackground>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  root: {
    flex: 1
  },
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 64
  }
});
