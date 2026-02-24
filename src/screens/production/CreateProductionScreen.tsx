import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getErrorMessage } from '../../api/client';
import { productionAPI } from '../../api/production.api';
import { productsAPI } from '../../api/products.api';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import Input from '../../components/common/Input';
import Loading from '../../components/common/Loading';
import { useThemeColors } from '../../constants/colors';
import { useProtectedRoute } from '../../hooks/useProtectedRoute';
import { ProductWithRecipe } from '../../types/product.types';
import {
  InsufficientMaterial,
  ProductRecipe,
  RegisterMaterialsRequest,
  RegisterMaterialsResponse,
} from '../../types/production.types';

interface MaterialData {
  id_product: number;
  quantity_used: string;
  waste: string;
  photo: string | null;
}


const CreateProductionScreen = () => {
  const toSafeNumber = (value: unknown): number => {
    const parsed = typeof value === 'number' ? value : Number.parseFloat(String(value));
    return Number.isFinite(parsed) ? parsed : 0;
  };
  const router = useRouter();
  const { showLoading } = useProtectedRoute();
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const [step, setStep] = useState<'select' | 'details' | 'confirm'>('select');
  const [products, setProducts] = useState<ProductWithRecipe[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<ProductWithRecipe | null>(null);
  const [recipe, setRecipe] = useState<ProductRecipe | null>(null);
  const [materialsData, setMaterialsData] = useState<Record<number, MaterialData>>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [isLoadingRecipe, setIsLoadingRecipe] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [productionResult, setProductionResult] = useState<RegisterMaterialsResponse | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setIsLoadingProducts(true);
      // Obtener solo productos con recetas
      const response = await productsAPI.getProductsWithRecipes();
      
      if (!response.success || !response.data || response.data.length === 0) {
        setProducts([]);
        return;
      }

      // Mapear ProductRecipe[] a ProductWithRecipe[]
      const productsWithRecipe: ProductWithRecipe[] = response.data.map((recipe: ProductRecipe) => ({
        id: recipe.id_product,
        id_category: 0, // No viene en la respuesta, se puede obtener después si es necesario
        id_origin: 0,
        id_measure: 0,
        name: recipe.product_name,
        sku: recipe.sku,
        type: 'PF' as const,
        min_stock: 0,
        quantity: 0,
        price: 0,
        is_active: true,
        creation_date: recipe.creation_date,
        modification_date: recipe.modification_date,
        has_recipe: true,
      }));
      
      setProducts(productsWithRecipe);
    } catch (error) {
      console.error('Error loading products with recipes:', error);
      Alert.alert('Error', 'No se pudieron cargar los productos con recetas');
    } finally {
      setIsLoadingProducts(false);
    }
  };

  const handleSelectProduct = async (product: ProductWithRecipe) => {
    try {
      setIsLoadingRecipe(true);
      setSelectedProduct(product);
      
      console.log('[handleSelectProduct] Producto seleccionado:', {
        id: product.id,
        name: product.name,
        sku: product.sku,
      });
      
      // Cargar receta del producto (ya tenemos la lista de productos con recetas, pero necesitamos los detalles completos)
      const recipeResponse = await productsAPI.getProductRecipe(product.id);
      
      console.log('[handleSelectProduct] Respuesta de receta:', {
        success: recipeResponse.success,
        data_length: recipeResponse.data?.length,
        all_products: recipeResponse.data?.map((r: any) => ({
          id_product: r.id_product,
          product_name: r.product_name,
          materials_count: r.materials?.length,
        })),
      });
      
      if (!recipeResponse.success || !recipeResponse.data || recipeResponse.data.length === 0) {
        Alert.alert(
          'Sin Receta',
          'Este producto no tiene receta configurada. Contacte al administrador.',
          [{ text: 'OK' }]
        );
        setIsLoadingRecipe(false);
        return;
      }

      // Buscar la receta que corresponde al producto seleccionado
      const productRecipe = recipeResponse.data.find((r: ProductRecipe) => r.id_product === product.id);
      
      if (!productRecipe) {
        console.error('[handleSelectProduct] No se encontró la receta para el producto:', product.id);
        console.error('[handleSelectProduct] Recetas disponibles:', recipeResponse.data.map((r: any) => r.id_product));
        Alert.alert(
          'Error',
          'No se pudo encontrar la receta del producto seleccionado.',
          [{ text: 'OK' }]
        );
        setIsLoadingRecipe(false);
        return;
      }
      
      console.log('[handleSelectProduct] Receta encontrada:', {
        id_product: productRecipe.id_product,
        product_name: productRecipe.product_name,
        materials_count: productRecipe.materials.length,
        materials: productRecipe.materials.map((m: any) => ({
          id: m.id,
          name: m.name,
          code: m.code,
        })),
      });
      
      // Inicializar datos de materiales
      const initialMaterialsData: Record<number, MaterialData> = {};
      productRecipe.materials.forEach((material: { id: number }) => {
        initialMaterialsData[material.id] = {
          id_product: material.id,
          quantity_used: '',
          waste: '0',
          photo: null,
        };
      });
      setMaterialsData(initialMaterialsData);
      
      // No necesitamos obtener stock, el backend lo validará
      setRecipe(productRecipe);
      setStep('details');
      setErrors({});
    } catch (error) {
      console.error('Error loading recipe:', error);
      Alert.alert('Error', getErrorMessage(error));
    } finally {
      setIsLoadingRecipe(false);
    }
  };

  const handleMaterialQuantityChange = (materialId: number, value: string) => {
    const cleaned = value.replace(/[^0-9.]/g, '');
    const parts = cleaned.split('.');
    const formatted = parts.length > 2 ? parts[0] + '.' + parts.slice(1).join('') : cleaned;
    
    setMaterialsData((prev) => ({
      ...prev,
      [materialId]: {
        ...prev[materialId],
        quantity_used: formatted,
      },
    }));
    
    // Limpiar error si existe
    if (errors[`material_${materialId}_quantity`]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[`material_${materialId}_quantity`];
        return newErrors;
      });
    }
  };

  const handleMaterialWasteChange = (materialId: number, value: string) => {
    const cleaned = value.replace(/[^0-9.]/g, '');
    const parts = cleaned.split('.');
    const formatted = parts.length > 2 ? parts[0] + '.' + parts.slice(1).join('') : cleaned;
    
    setMaterialsData((prev) => ({
      ...prev,
      [materialId]: {
        ...prev[materialId],
        waste: formatted,
      },
    }));
    
    // Limpiar error si existe
    if (errors[`material_${materialId}_waste`]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[`material_${materialId}_waste`];
        return newErrors;
      });
    }
  };

  const pickImage = async (materialId: number) => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permisos', 'Se necesitan permisos para acceder a la galería');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
        base64: true,
      });

      if (!result.canceled && result.assets[0]) {
        const base64Image = `data:image/jpeg;base64,${result.assets[0].base64}`;
        setMaterialsData((prev) => ({
          ...prev,
          [materialId]: {
            ...prev[materialId],
            photo: base64Image,
          },
        }));
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'No se pudo seleccionar la imagen');
    }
  };

  const takePhoto = async (materialId: number) => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permisos', 'Se necesitan permisos para acceder a la cámara');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
        base64: true,
      });

      if (!result.canceled && result.assets[0]) {
        const base64Image = `data:image/jpeg;base64,${result.assets[0].base64}`;
        setMaterialsData((prev) => ({
          ...prev,
          [materialId]: {
            ...prev[materialId],
            photo: base64Image,
          },
        }));
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Error', 'No se pudo tomar la foto');
    }
  };

  const showImagePickerOptions = (materialId: number) => {
    Alert.alert(
      'Seleccionar Foto',
      '¿Cómo desea agregar la foto?',
      [
        { text: 'Cámara', onPress: () => takePhoto(materialId) },
        { text: 'Galería', onPress: () => pickImage(materialId) },
        { text: 'Cancelar', style: 'cancel' },
      ]
    );
  };

  const removePhoto = (materialId: number) => {
    setMaterialsData((prev) => ({
      ...prev,
      [materialId]: {
        ...prev[materialId],
        photo: null,
      },
    }));
  };

  const validateMaterials = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!recipe) return false;

    recipe.materials.forEach((material) => {
      const materialData = materialsData[material.id];
      if (!materialData) {
        newErrors[`material_${material.id}_quantity`] = 'Datos del material requeridos';
        return;
      }

      const quantityUsed = Number.parseFloat(materialData.quantity_used);
      if (!materialData.quantity_used.trim()) {
        newErrors[`material_${material.id}_quantity`] = 'La cantidad usada es requerida';
      } else if (Number.isNaN(quantityUsed) || quantityUsed <= 0) {
        newErrors[`material_${material.id}_quantity`] = 'Ingrese una cantidad válida mayor a 0';
      }

      const waste = Number.parseFloat(materialData.waste);
      if (materialData.waste.trim() && (Number.isNaN(waste) || waste < 0)) {
        newErrors[`material_${material.id}_waste`] = 'El desperdicio debe ser un número válido mayor o igual a 0';
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const showStockInsufficientModal = (insufficient: InsufficientMaterial[]) => {
    const materialList = insufficient
      .map((m) => `• ${m.name}\n  Necesario: ${m.required} ${recipe?.materials.find((mat) => mat.id === m.id_product)?.measure_name || ''}\n  Disponible: ${m.available} ${recipe?.materials.find((mat) => mat.id === m.id_product)?.measure_name || ''}\n  Faltante: ${m.missing} ${recipe?.materials.find((mat) => mat.id === m.id_product)?.measure_name || ''}`)
      .join('\n\n');

    Alert.alert(
      'Stock Insuficiente',
      `No se puede registrar el consumo de materiales.\n\n${materialList}\n\nContacte al administrador para solicitar más material.`,
      [{ text: 'Entendido', style: 'default' }]
    );
  };

  const handleRegister = async () => {
    if (!selectedProduct || !recipe) return;

    if (!validateMaterials()) {
      return;
    }

    setIsRegistering(true);
    try {
      const materials = recipe.materials.map((material) => {
        const materialData = materialsData[material.id];
        return {
          id_product: material.id,
          quantity_used: Number.parseFloat(materialData.quantity_used),
          waste: Number.parseFloat(materialData.waste || '0'),
          ...(materialData.photo ? { details: materialData.photo } : {}),
        };
      });

      const request: RegisterMaterialsRequest = {
        id_product: selectedProduct.id,
        materials,
      };

      // Log del request completo
      console.log('=== REGISTRO DE MATERIALES ===');
      console.log('URL:', '/production/register-materials');
      console.log('Request completo:', JSON.stringify(request, null, 2));
      console.log('Producto Final ID:', request.id_product);
      console.log('Cantidad de materiales:', request.materials.length);
      request.materials.forEach((mat, index) => {
        console.log(`Material ${index + 1}:`, {
          id_product: mat.id_product,
          quantity_used: mat.quantity_used,
          waste: mat.waste,
          has_photo: !!mat.details,
          photo_length: mat.details ? mat.details.length : 0,
        });
      });
      console.log('==============================');

      const response = await productionAPI.registerMaterials(request);
      setProductionResult(response);
      setStep('confirm');
    } catch (error: any) {
      console.error('Error registering materials:', error);
      
      // Manejar error de stock insuficiente del backend
      if (error.response?.data?.data?.insufficient_materials) {
        showStockInsufficientModal(error.response.data.data.insufficient_materials);
      } else {
        Alert.alert('Error', getErrorMessage(error));
      }
    } finally {
      setIsRegistering(false);
    }
  };

  const handleBack = () => {
    if (step === 'details') {
      setStep('select');
      setSelectedProduct(null);
      setRecipe(null);
      setMaterialsData({});
      setErrors({});
    } else if (step === 'confirm') {
      setStep('details');
      setProductionResult(null);
    }
  };

  const handleFinish = () => {
    router.back();
  };

  const handleRegisterAnother = () => {
    setStep('select');
    setSelectedProduct(null);
    setRecipe(null);
    setMaterialsData({});
    setErrors({});
    setProductionResult(null);
    loadProducts();
  };

  const filteredProducts = useMemo(() => {
    if (!searchTerm.trim()) return products;
    const searchLower = searchTerm.toLowerCase();
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(searchLower) ||
        p.sku.toLowerCase().includes(searchLower)
    );
  }, [products, searchTerm]);


  if (showLoading || isLoadingProducts) {
    return <Loading />;
  }

  // Paso 1: Selección de Producto
  if (step === 'select') {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.SURFACE} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Producción Diaria</Text>
          <View style={styles.headerSpacer} />
        </View>

        <View style={styles.searchContainer}>
          <Ionicons name="search-outline" size={20} color={colors.TEXT_SECONDARY} style={styles.searchIcon} />
          <Input
            placeholder="Buscar producto..."
            value={searchTerm}
            onChangeText={setSearchTerm}
            style={styles.searchInput}
          />
        </View>

        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
          {filteredProducts.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="cube-outline" size={64} color={colors.TEXT_SECONDARY} />
              <Text style={styles.emptyText}>
                {searchTerm ? 'No se encontraron productos' : 'No hay productos disponibles'}
              </Text>
            </View>
          ) : (
            filteredProducts.map((product) => (
              <TouchableOpacity
                key={product.id}
                style={styles.productCard}
                onPress={() => handleSelectProduct(product)}
              >
                <View style={styles.productCardHeader}>
                  <View style={styles.productInfo}>
                    <Text style={styles.productName}>{product.name}</Text>
                    <Text style={styles.productSku}>SKU: {product.sku}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={24} color={colors.TEXT_SECONDARY} />
                </View>
                <View style={styles.productCardFooter}>
                  {product.has_recipe ? (
                    <View style={styles.recipeBadge}>
                      <Ionicons name="checkmark-circle" size={16} color={colors.SUCCESS} />
                      <Text style={styles.recipeText}>Receta configurada</Text>
                    </View>
                  ) : (
                    <View style={styles.noRecipeBadge}>
                      <Ionicons name="close-circle" size={16} color={colors.ERROR} />
                      <Text style={styles.noRecipeText}>Sin receta</Text>
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            ))
          )}
        </ScrollView>
      </SafeAreaView>
    );
  }

  // Paso 2: Detalles de Producción
  if (step === 'details') {
    if (isLoadingRecipe) {
      return (
        <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
          <View style={styles.header}>
            <TouchableOpacity onPress={handleBack} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color={colors.SURFACE} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Producción Diaria</Text>
            <View style={styles.headerSpacer} />
          </View>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.PRIMARY} />
            <Text style={styles.loadingText}>Cargando receta...</Text>
          </View>
        </SafeAreaView>
      );
    }

    if (!selectedProduct || !recipe) {
      return (
        <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
          <View style={styles.header}>
            <TouchableOpacity onPress={handleBack} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color={colors.SURFACE} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Producción Diaria</Text>
            <View style={styles.headerSpacer} />
          </View>
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle-outline" size={64} color={colors.ERROR} />
            <Text style={styles.errorText}>No se pudo cargar la receta</Text>
            <Button title="Volver" onPress={handleBack} style={styles.backButtonStyle} />
          </View>
        </SafeAreaView>
      );
    }

    return (
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.SURFACE} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{selectedProduct.name}</Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
          <Card style={styles.card}>
            <Text style={styles.cardTitle}>Registro de Materiales</Text>
            <Text style={styles.cardSubtitle}>
              Ingrese la cantidad usada y desperdicio de cada material
            </Text>
          </Card>

          {recipe.materials.length === 0 ? (
            <Card style={styles.card}>
              <Text style={styles.noMaterialsText}>
                Este producto no tiene materiales configurados en su receta
              </Text>
            </Card>
          ) : (
            recipe.materials.map((material) => {
              const materialData = materialsData[material.id] || {
                id_product: material.id,
                quantity_used: '',
                waste: '0',
                photo: null,
              };

              return (
                <Card key={material.id} style={styles.card}>
                  <View style={styles.materialCardHeader}>
                    <View style={styles.materialHeader}>
                      <Ionicons
                        name="cube-outline"
                        size={20}
                        color={colors.PRIMARY}
                      />
                      <Text style={styles.materialName}>{material.name}</Text>
                    </View>
                    <Text style={styles.materialCode}>Código: {material.code}</Text>
                    <Text style={styles.materialMeasure}>
                      Unidad: {material.measure_name}
                    </Text>
                  </View>

                  <View style={styles.materialInputsContainer}>
                    <Input
                      label="Cantidad Usada"
                      placeholder="0"
                      value={materialData.quantity_used}
                      onChangeText={(text) => handleMaterialQuantityChange(material.id, text)}
                      keyboardType="decimal-pad"
                      error={errors[`material_${material.id}_quantity`]}
                      required
                      style={styles.materialInput}
                    />

                    <Input
                      label="Desperdicio (opcional)"
                      placeholder="0"
                      value={materialData.waste}
                      onChangeText={(text) => handleMaterialWasteChange(material.id, text)}
                      keyboardType="decimal-pad"
                      error={errors[`material_${material.id}_waste`]}
                      style={styles.materialInput}
                    />
                  </View>

                  <View style={styles.photoSection}>
                    <Text style={styles.photoLabel}>Foto (opcional)</Text>
                    {materialData.photo ? (
                      <View style={styles.photoContainer}>
                        <Image
                          source={{ uri: materialData.photo }}
                          style={styles.photoPreview}
                        />
                        <TouchableOpacity
                          style={styles.removePhotoButton}
                          onPress={() => removePhoto(material.id)}
                        >
                          <Ionicons name="close-circle" size={24} color={colors.ERROR} />
                        </TouchableOpacity>
                      </View>
                    ) : (
                      <TouchableOpacity
                        style={styles.addPhotoButton}
                        onPress={() => showImagePickerOptions(material.id)}
                      >
                        <Ionicons name="camera-outline" size={24} color={colors.PRIMARY} />
                        <Text style={styles.addPhotoText}>Agregar Foto</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </Card>
              );
            })
          )}

          <View style={styles.warningBox}>
            <Ionicons name="information-circle-outline" size={20} color={colors.INFO} />
            <Text style={styles.warningText}>
              El stock de materiales será validado automáticamente al registrar la producción.
            </Text>
          </View>

          <View style={styles.buttonContainer}>
            <Button
              title="Cancelar"
              onPress={handleBack}
              variant="outline"
              style={styles.cancelButton}
            />
            <Button
              title="Registrar Producción"
              onPress={handleRegister}
              isLoading={isRegistering}
              style={styles.registerButton}
            />
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // Paso 3: Confirmación
  if (step === 'confirm' && productionResult) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
        <View style={styles.header}>
          <View style={styles.headerSpacer} />
          <Text style={styles.headerTitle}>Producción Registrada</Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
          <Card style={styles.confirmCard}>
            <View style={styles.successIconContainer}>
              <Ionicons name="checkmark-circle" size={64} color={colors.SUCCESS} />
            </View>
            <Text style={styles.confirmTitle}>Producción Registrada</Text>

            <View style={styles.confirmSection}>
              <Text style={styles.confirmLabel}>Producto Final</Text>
              <Text style={styles.confirmValue}>{productionResult.data.product_final.name}</Text>
              <Text style={styles.confirmSubValue}>
                SKU: {productionResult.data.product_final.sku}
              </Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.confirmSection}>
              <Text style={styles.confirmLabel}>Materiales Consumidos</Text>
              {productionResult.data.materials_consumed.map((material) => (
                <View key={material.id_product} style={styles.consumedMaterial}>
                  <Text style={styles.consumedMaterialName}>• {material.name}</Text>
                  <View style={styles.consumedMaterialDetails}>
                    <Text style={styles.consumedMaterialQty}>
                      Usado: {toSafeNumber(material.quantity_used).toFixed(2)} {material.sku}
                    </Text>
                    {toSafeNumber(material.waste) > 0 && (
                      <Text style={styles.consumedMaterialWaste}>
                        Desperdicio: {toSafeNumber(material.waste).toFixed(2)}
                      </Text>
                    )}
                    <Text style={styles.consumedMaterialEffective}>
                      Efectivo: {toSafeNumber(material.effective_quantity).toFixed(2)}
                    </Text>
                  </View>
                </View>
              ))}
            </View>

            <View style={styles.divider} />

            <View style={styles.confirmSection}>
              <Text style={styles.confirmLabel}>Resumen</Text>
              <Text style={styles.confirmSubValue}>
                Total Consumido: {toSafeNumber(productionResult.data.summary.total_consumed).toFixed(2)}
              </Text>
              {toSafeNumber(productionResult.data.summary.total_waste) > 0 && (
                <Text style={styles.confirmSubValue}>
                  Total Desperdicio: {toSafeNumber(productionResult.data.summary.total_waste).toFixed(2)}
                </Text>
              )}
              <View style={styles.statusRow}>
                <Text style={styles.confirmLabel}>Estado:</Text>
                <View style={[styles.statusBadge, { backgroundColor: colors.WARNING_LIGHT }]}>
                  <Text style={[styles.statusText, { color: colors.WARNING }]}>
                    ⏳ {productionResult.data.summary.status === 'pending' ? 'Pendiente' : 'Completada'}
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.infoBox}>
              <Ionicons name="information-circle-outline" size={20} color={colors.INFO} />
              <Text style={styles.infoText}>
                {productionResult.message || 'Un administrador debe completar la producción en el dashboard para que el producto final se genere en el inventario.'}
              </Text>
            </View>
          </Card>

          <View style={styles.buttonContainer}>
            <Button
              title="Registrar Otra"
              onPress={handleRegisterAnother}
              variant="outline"
              style={styles.anotherButton}
            />
            <Button
              title="Volver"
              onPress={handleFinish}
              style={styles.finishButton}
            />
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return null;
};

const createStyles = (colors: ReturnType<typeof useThemeColors>) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.BACKGROUND,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: colors.PRIMARY,
      paddingHorizontal: 16,
      paddingVertical: 12,
    },
    backButton: {
      padding: 4,
    },
    headerTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.SURFACE,
      flex: 1,
      textAlign: 'center',
    },
    headerSpacer: {
      width: 32,
    },
    searchContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.SURFACE,
      marginHorizontal: 16,
      marginTop: 12,
      marginBottom: 8,
      paddingHorizontal: 12,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: colors.BORDER,
    },
    searchIcon: {
      marginRight: 8,
    },
    searchInput: {
      flex: 1,
      marginBottom: 0,
    },
    scrollView: {
      flex: 1,
    },
    scrollContent: {
      padding: 16,
      paddingBottom: 32,
    },
    productCard: {
      backgroundColor: colors.SURFACE,
      borderRadius: 12,
      padding: 16,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: colors.BORDER,
    },
    productCardHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 12,
    },
    productInfo: {
      flex: 1,
    },
    productName: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.TEXT_PRIMARY,
      marginBottom: 4,
    },
    productSku: {
      fontSize: 14,
      color: colors.TEXT_SECONDARY,
    },
    productCardFooter: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    stockInfo: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    stockText: {
      fontSize: 14,
      color: colors.TEXT_SECONDARY,
    },
    recipeBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      backgroundColor: colors.SUCCESS_LIGHT,
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
    },
    recipeText: {
      fontSize: 12,
      color: colors.SUCCESS,
      fontWeight: '600',
    },
    noRecipeBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      backgroundColor: colors.ERROR_LIGHT,
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
    },
    noRecipeText: {
      fontSize: 12,
      color: colors.ERROR,
      fontWeight: '600',
    },
    card: {
      marginBottom: 16,
    },
    cardTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.TEXT_PRIMARY,
      marginBottom: 8,
    },
    cardSubtitle: {
      fontSize: 14,
      color: colors.TEXT_SECONDARY,
      marginBottom: 16,
    },
    materialCardHeader: {
      marginBottom: 16,
      paddingBottom: 12,
      borderBottomWidth: 1,
      borderBottomColor: colors.BORDER,
    },
    materialInputsContainer: {
      gap: 12,
      marginBottom: 16,
    },
    materialInput: {
      marginBottom: 0,
    },
    photoSection: {
      marginTop: 8,
    },
    photoLabel: {
      fontSize: 14,
      fontWeight: '500',
      color: colors.TEXT_PRIMARY,
      marginBottom: 8,
    },
    photoContainer: {
      position: 'relative',
      width: '100%',
      height: 200,
      borderRadius: 8,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: colors.BORDER,
    },
    photoPreview: {
      width: '100%',
      height: '100%',
      resizeMode: 'cover',
    },
    removePhotoButton: {
      position: 'absolute',
      top: 8,
      right: 8,
      backgroundColor: colors.SURFACE,
      borderRadius: 20,
      padding: 4,
    },
    addPhotoButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      padding: 16,
      borderWidth: 2,
      borderColor: colors.BORDER,
      borderStyle: 'dashed',
      borderRadius: 8,
      backgroundColor: colors.SURFACE,
    },
    addPhotoText: {
      fontSize: 14,
      color: colors.PRIMARY,
      fontWeight: '500',
    },
    measureText: {
      fontSize: 12,
      color: colors.TEXT_SECONDARY,
      marginTop: -8,
      marginBottom: 8,
      marginLeft: 12,
    },
    materialsList: {
      gap: 16,
    },
    materialItem: {
      paddingBottom: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.BORDER,
    },
    materialHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      marginBottom: 12,
    },
    materialName: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.TEXT_PRIMARY,
    },
    materialDetails: {
      marginTop: 8,
      gap: 4,
    },
    materialCode: {
      fontSize: 14,
      color: colors.TEXT_SECONDARY,
    },
    materialMeasure: {
      fontSize: 14,
      color: colors.TEXT_SECONDARY,
    },
    noMaterialsText: {
      fontSize: 14,
      color: colors.TEXT_SECONDARY,
      textAlign: 'center',
      paddingVertical: 16,
    },
    warningBox: {
      flexDirection: 'row',
      backgroundColor: colors.WARNING_LIGHT,
      padding: 12,
      borderRadius: 8,
      marginBottom: 16,
      gap: 8,
    },
    warningText: {
      flex: 1,
      fontSize: 14,
      color: colors.TEXT_PRIMARY,
    },
    buttonContainer: {
      flexDirection: 'row',
      gap: 12,
      marginTop: 8,
    },
    cancelButton: {
      flex: 1,
    },
    registerButton: {
      flex: 1,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 32,
    },
    loadingText: {
      marginTop: 16,
      fontSize: 16,
      color: colors.TEXT_SECONDARY,
    },
    errorContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 32,
    },
    errorText: {
      fontSize: 16,
      color: colors.TEXT_SECONDARY,
      marginTop: 16,
      marginBottom: 24,
      textAlign: 'center',
    },
    backButtonStyle: {
      marginTop: 16,
    },
    emptyState: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingVertical: 64,
    },
    emptyText: {
      marginTop: 16,
      fontSize: 16,
      color: colors.TEXT_SECONDARY,
      textAlign: 'center',
    },
    confirmCard: {
      marginBottom: 16,
    },
    successIconContainer: {
      alignItems: 'center',
      marginBottom: 16,
    },
    confirmTitle: {
      fontSize: 20,
      fontWeight: '700',
      color: colors.TEXT_PRIMARY,
      textAlign: 'center',
      marginBottom: 24,
    },
    confirmSection: {
      marginBottom: 16,
    },
    confirmLabel: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.TEXT_SECONDARY,
      marginBottom: 8,
    },
    confirmValue: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.TEXT_PRIMARY,
      marginBottom: 4,
    },
    confirmSubValue: {
      fontSize: 14,
      color: colors.TEXT_SECONDARY,
    },
    divider: {
      height: 1,
      backgroundColor: colors.BORDER,
      marginVertical: 16,
    },
    consumedMaterial: {
      marginBottom: 12,
      paddingBottom: 12,
      borderBottomWidth: 1,
      borderBottomColor: colors.BORDER,
    },
    consumedMaterialName: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.TEXT_PRIMARY,
      marginBottom: 8,
    },
    consumedMaterialDetails: {
      gap: 4,
    },
    consumedMaterialQty: {
      fontSize: 14,
      color: colors.TEXT_SECONDARY,
    },
    consumedMaterialWaste: {
      fontSize: 14,
      color: colors.WARNING,
    },
    consumedMaterialEffective: {
      fontSize: 14,
      fontWeight: '500',
      color: colors.SUCCESS,
    },
    statusRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 8,
    },
    statusBadge: {
      backgroundColor: colors.WARNING_LIGHT,
      paddingHorizontal: 12,
      paddingVertical: 4,
      borderRadius: 12,
    },
    statusText: {
      fontSize: 12,
      fontWeight: '600',
      color: colors.WARNING,
    },
    infoBox: {
      flexDirection: 'row',
      backgroundColor: colors.INFO_LIGHT,
      padding: 12,
      borderRadius: 8,
      marginTop: 8,
      gap: 8,
    },
    infoText: {
      flex: 1,
      fontSize: 12,
      color: colors.TEXT_PRIMARY,
    },
    anotherButton: {
      flex: 1,
    },
    finishButton: {
      flex: 1,
    },
  });

export default CreateProductionScreen;
