import React, { useState } from 'react';
import { ChakraProvider, Box, VStack, Heading, Text, Button, Image, Progress, SimpleGrid, Stat, StatLabel, StatNumber, Badge, Container, Flex } from '@chakra-ui/react';
import ImageCapture from './components/ImageCapture';
import SkinAnalysisDashboard from './components/SkinAnalysisDashboard';
import ProductRecommendations from './components/ProductRecommendations';
import theme from './theme';

function App() {
  const [image, setImage] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResults, setAnalysisResults] = useState(null);
  const [recommendedProducts, setRecommendedProducts] = useState([]);

  const handleImageCaptured = (imageData) => {
    setImage(imageData);
    setAnalysisResults(null);
    setRecommendedProducts([]);
  };

  const analyzeSkin = async () => {
    if (!image) return;

    setIsAnalyzing(true);
    
    try {
      // Convert base64 to blob
      const base64Response = await fetch(image);
      const blob = await base64Response.blob();
      
      // Create form data
      const formData = new FormData();
      formData.append('file', blob, 'image.jpg');
      
      // Send to backend for analysis
      const response = await fetch('http://localhost:8000/analyze-skin', {
        method: 'POST',
        body: formData,
      });
      
      const data = await response.json();
      setAnalysisResults(data);
      
      // Get product recommendations based on analysis
      const recResponse = await fetch('http://localhost:8000/recommend-products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      const recData = await recResponse.json();
      setRecommendedProducts(recData.products);
    } catch (error) {
      console.error('Error analyzing skin:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <ChakraProvider theme={theme}>
      <Container maxW="container.xl" py={10}>
        <VStack spacing={8} align="stretch">
          <Heading as="h1" size="xl" textAlign="center">
            Skincare Analysis & Recommendation System
          </Heading>
          
          <Flex direction={{ base: 'column', md: 'row' }} gap={6}>
            <Box flex="1" p={6} borderWidth="1px" borderRadius="lg" bg="white">
              <VStack spacing={4}>
                <Heading size="md">Upload Your Skin Image</Heading>
                <ImageCapture onImageCaptured={handleImageCaptured} />
                <Button 
                  colorScheme="teal" 
                  size="lg" 
                  onClick={analyzeSkin} 
                  isLoading={isAnalyzing}
                  isDisabled={!image}
                  width="full"
                >
                  Analyze Skin
                </Button>
              </VStack>
            </Box>
            
            {analysisResults && (
              <Box flex="1" p={6} borderWidth="1px" borderRadius="lg" bg="white">
                <SkinAnalysisDashboard analysisResults={analysisResults} />
              </Box>
            )}
          </Flex>
          
          {recommendedProducts.length > 0 && (
            <Box p={6} borderWidth="1px" borderRadius="lg" bg="white">
              <ProductRecommendations products={recommendedProducts} />
            </Box>
          )}
        </VStack>
      </Container>
    </ChakraProvider>
  );
}

export default App;
