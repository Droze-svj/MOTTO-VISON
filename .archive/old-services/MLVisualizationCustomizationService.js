import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import * as Crypto from 'expo-crypto';
import { getDeviceInfo } from './platformService';
import { logSecurityEvent } from '../utils/logger';
import * as tf from '@tensorflow/tfjs';
import '@tensorflow/tfjs-react-native';
import { View, Text, TouchableOpacity, ScrollView, Modal, StyleSheet } from 'react-native';
import { LineChart, BarChart, ScatterPlot, HeatMap, PieChart, RadarChart } from 'react-native-chart-kit';
import { GestureHandlerRootView, PinchGestureHandler, PanGestureHandler } from 'react-native-gesture-handler';
// SVG imports removed - using alternative rendering methods
import { ColorPicker } from 'react-native-color-picker';
import { Slider } from '@react-native-community/slider';

class MLVisualizationCustomizationService {
  constructor() {
    this.customizationOptions = {
      // Visual Styling
      visualStyles: {
        colorSchemes: {
          default: {
            primary: '#2196F3',
            secondary: '#FFC107',
            background: '#FFFFFF',
            text: '#000000',
            accent: '#4CAF50',
            error: '#F44336',
            warning: '#FF9800',
            success: '#4CAF50',
            info: '#2196F3'
          },
          dark: {
            primary: '#BB86FC',
            secondary: '#03DAC6',
            background: '#121212',
            text: '#FFFFFF',
            accent: '#CF6679',
            error: '#CF6679',
            warning: '#FFB74D',
            success: '#81C784',
            info: '#64B5F6'
          },
          custom: {}
        },
        typography: {
          fontFamily: 'System',
          fontSize: {
            small: 12,
            medium: 16,
            large: 20,
            xlarge: 24
          },
          fontWeight: {
            light: '300',
            regular: '400',
            medium: '500',
            bold: '700'
          },
          lineHeight: {
            small: 16,
            medium: 24,
            large: 32,
            xlarge: 40
          }
        },
        spacing: {
          small: 4,
          medium: 8,
          large: 16,
          xlarge: 24
        },
        borderRadius: {
          small: 4,
          medium: 8,
          large: 16,
          xlarge: 24
        },
        shadows: {
          small: {
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.2,
            shadowRadius: 1.41,
            elevation: 2
          },
          medium: {
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.23,
            shadowRadius: 2.62,
            elevation: 4
          },
          large: {
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 4.65,
            elevation: 8
          }
        }
      },

      // Chart Customization
      chartOptions: {
        lineChart: {
          strokeWidth: 2,
          strokeDasharray: [],
          curve: 'linear',
          pointRadius: 4,
          pointColor: '#2196F3',
          gridColor: '#E0E0E0',
          gridWidth: 1,
          showPoints: true,
          showArea: false,
          areaOpacity: 0.3
        },
        barChart: {
          barWidth: 20,
          barSpacing: 10,
          barColor: '#2196F3',
          showValue: true,
          valueColor: '#000000',
          valueSize: 12,
          showGrid: true,
          gridColor: '#E0E0E0',
          gridWidth: 1
        },
        scatterPlot: {
          pointSize: 6,
          pointColor: '#2196F3',
          showLabels: true,
          labelColor: '#000000',
          labelSize: 12,
          showGrid: true,
          gridColor: '#E0E0E0',
          gridWidth: 1
        },
        heatMap: {
          colorScale: ['#FFFFFF', '#2196F3', '#000000'],
          showLabels: true,
          labelColor: '#000000',
          labelSize: 12,
          showGrid: true,
          gridColor: '#E0E0E0',
          gridWidth: 1
        }
      },

      // Interaction Options
      interactionOptions: {
        zoom: {
          enabled: true,
          minScale: 0.5,
          maxScale: 3,
          scaleStep: 0.1
        },
        pan: {
          enabled: true,
          direction: 'both',
          speed: 1
        },
        tooltip: {
          enabled: true,
          position: 'top',
          backgroundColor: '#FFFFFF',
          textColor: '#000000',
          fontSize: 12,
          padding: 8,
          borderRadius: 4
        },
        selection: {
          enabled: true,
          color: 'rgba(33, 150, 243, 0.3)',
          borderColor: '#2196F3',
          borderWidth: 1
        },
        animation: {
          enabled: true,
          duration: 300,
          easing: 'ease-in-out'
        }
      },

      // Layout Options
      layoutOptions: {
        responsive: true,
        aspectRatio: 16/9,
        padding: {
          top: 20,
          right: 20,
          bottom: 20,
          left: 20
        },
        margin: {
          top: 0,
          right: 0,
          bottom: 0,
          left: 0
        },
        grid: {
          enabled: true,
          columns: 12,
          rows: 12,
          gap: 16
        }
      }
    };
  }

  // Visual Style Methods
  applyVisualStyle(component, style) {
    return StyleSheet.create({
      container: {
        backgroundColor: style.colorSchemes.default.background,
        padding: style.spacing.medium,
        borderRadius: style.borderRadius.medium,
        ...style.shadows.medium
      },
      text: {
        fontFamily: style.typography.fontFamily,
        fontSize: style.typography.fontSize.medium,
        fontWeight: style.typography.fontWeight.regular,
        lineHeight: style.typography.lineHeight.medium,
        color: style.colorSchemes.default.text
      }
    });
  }

  // Chart Customization Methods
  customizeLineChart(data, options) {
    return {
      ...data,
      strokeWidth: options.strokeWidth,
      strokeDasharray: options.strokeDasharray,
      curve: options.curve,
      pointRadius: options.pointRadius,
      pointColor: options.pointColor,
      gridColor: options.gridColor,
      gridWidth: options.gridWidth,
      showPoints: options.showPoints,
      showArea: options.showArea,
      areaOpacity: options.areaOpacity
    };
  }

  customizeBarChart(data, options) {
    return {
      ...data,
      barWidth: options.barWidth,
      barSpacing: options.barSpacing,
      barColor: options.barColor,
      showValue: options.showValue,
      valueColor: options.valueColor,
      valueSize: options.valueSize,
      showGrid: options.showGrid,
      gridColor: options.gridColor,
      gridWidth: options.gridWidth
    };
  }

  // Interaction Customization Methods
  setupZoomInteraction(options) {
    return {
      enabled: options.enabled,
      minScale: options.minScale,
      maxScale: options.maxScale,
      scaleStep: options.scaleStep,
      onZoom: (scale) => this.handleZoom(scale, options)
    };
  }

  setupPanInteraction(options) {
    return {
      enabled: options.enabled,
      direction: options.direction,
      speed: options.speed,
      onPan: (position) => this.handlePan(position, options)
    };
  }

  setupTooltip(options) {
    return {
      enabled: options.enabled,
      position: options.position,
      backgroundColor: options.backgroundColor,
      textColor: options.textColor,
      fontSize: options.fontSize,
      padding: options.padding,
      borderRadius: options.borderRadius,
      render: (data) => this.renderTooltip(data, options)
    };
  }

  // Layout Customization Methods
  applyLayout(component, options) {
    return {
      responsive: options.responsive,
      aspectRatio: options.aspectRatio,
      padding: options.padding,
      margin: options.margin,
      grid: options.grid.enabled ? this.setupGrid(options.grid) : null
    };
  }

  setupGrid(options) {
    return {
      columns: options.columns,
      rows: options.rows,
      gap: options.gap,
      container: {
        display: 'grid',
        gridTemplateColumns: `repeat(${options.columns}, 1fr)`,
        gridTemplateRows: `repeat(${options.rows}, 1fr)`,
        gap: options.gap
      }
    };
  }

  // Customization UI Components
  renderCustomizationPanel(options, onUpdate) {
    return (
      <ScrollView>
        <View style={styles.panel}>
          <Text style={styles.sectionTitle}>Visual Style</Text>
          {this.renderColorSchemeSelector(options.visualStyles.colorSchemes, onUpdate)}
          {this.renderTypographySelector(options.visualStyles.typography, onUpdate)}
          {this.renderSpacingSelector(options.visualStyles.spacing, onUpdate)}
          
          <Text style={styles.sectionTitle}>Chart Options</Text>
          {this.renderChartOptionsSelector(options.chartOptions, onUpdate)}
          
          <Text style={styles.sectionTitle}>Interaction Options</Text>
          {this.renderInteractionOptionsSelector(options.interactionOptions, onUpdate)}
          
          <Text style={styles.sectionTitle}>Layout Options</Text>
          {this.renderLayoutOptionsSelector(options.layoutOptions, onUpdate)}
        </View>
      </ScrollView>
    );
  }

  renderColorSchemeSelector(schemes, onUpdate) {
    return (
      <View style={styles.selector}>
        <Text>Color Scheme</Text>
        <ColorPicker
          onColorSelected={color => onUpdate({ colorSchemes: { ...schemes, custom: color } })}
          style={styles.colorPicker}
        />
      </View>
    );
  }

  renderTypographySelector(typography, onUpdate) {
    return (
      <View style={styles.selector}>
        <Text>Typography</Text>
        <Slider
          value={typography.fontSize.medium}
          onValueChange={value => onUpdate({ typography: { ...typography, fontSize: { ...typography.fontSize, medium: value } } })}
          minimumValue={8}
          maximumValue={32}
          step={1}
        />
      </View>
    );
  }

  renderChartOptionsSelector(options, onUpdate) {
    return (
      <View style={styles.selector}>
        <Text>Chart Options</Text>
        {Object.entries(options).map(([key, value]) => (
          <TouchableOpacity
            key={key}
            onPress={() => onUpdate({ chartOptions: { ...options, [key]: !value } })}
          >
            <Text>{key}</Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  }

  renderInteractionOptionsSelector(options, onUpdate) {
    return (
      <View style={styles.selector}>
        <Text>Interaction Options</Text>
        {Object.entries(options).map(([key, value]) => (
          <TouchableOpacity
            key={key}
            onPress={() => onUpdate({ interactionOptions: { ...options, [key]: !value } })}
          >
            <Text>{key}</Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  }

  renderLayoutOptionsSelector(options, onUpdate) {
    return (
      <View style={styles.selector}>
        <Text>Layout Options</Text>
        <Slider
          value={options.aspectRatio}
          onValueChange={value => onUpdate({ layoutOptions: { ...options, aspectRatio: value } })}
          minimumValue={1}
          maximumValue={2}
          step={0.1}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  panel: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16
  },
  selector: {
    marginBottom: 16
  },
  colorPicker: {
    height: 200
  }
});

export default new MLVisualizationCustomizationService(); 