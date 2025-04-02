import React, { useState, useRef } from 'react';
import { Box, Button, VStack, Image, Text, Flex, Icon } from '@chakra-ui/react';
import { FaCamera, FaUpload } from 'react-icons/fa';

const ImageCapture = ({ onImageCaptured }) => {
  const [capturedImage, setCapturedImage] = useState(null);
  const fileInputRef = useRef(null);
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [isStreaming, setIsStreaming] = useState(false);
  
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCapturedImage(reader.result);
        onImageCaptured(reader.result);
        stopCamera();
      };
      reader.readAsDataURL(file);
    }
  };
  
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      videoRef.current.srcObject = stream;
      streamRef.current = stream;
      setIsStreaming(true);
    } catch (err) {
      console.error("Error accessing camera:", err);
    }
  };
  
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
      setIsStreaming(false);
    }
  };
  
  const captureImage = () => {
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d').drawImage(video, 0, 0);
    const imageDataUrl = canvas.toDataURL('image/jpeg');
    setCapturedImage(imageDataUrl);
    onImageCaptured(imageDataUrl);
    stopCamera();
  };
  
  return (
    <VStack spacing={4} width="full">
      <Box position="relative" width="full" borderRadius="md" overflow="hidden">
        {capturedImage ? (
          <Image 
            src={capturedImage} 
            alt="Captured skin" 
            maxH="300px" 
            mx="auto"
            objectFit="contain"
            borderRadius="md"
          />
        ) : isStreaming ? (
          <Box width="full">
            <video 
              ref={videoRef} 
              autoPlay 
              style={{ width: '100%', borderRadius: '0.375rem' }}
            />
          </Box>
        ) : (
          <Box 
            bg="gray.100" 
            height="200px" 
            width="full" 
            display="flex" 
            alignItems="center" 
            justifyContent="center"
            borderRadius="md"
          >
            <Text color="gray.500">No image captured</Text>
          </Box>
        )}
      </Box>
      
      <Flex width="full" gap={4}>
        {isStreaming ? (
          <Button 
            leftIcon={<Icon as={FaCamera} />}
            colorScheme="blue" 
            onClick={captureImage}
            flex="1"
          >
            Capture
          </Button>
        ) : (
          <Button 
            leftIcon={<Icon as={FaCamera} />}
            colorScheme="blue" 
            onClick={startCamera}
            flex="1"
          >
            Use Camera
          </Button>
        )}
        
        <Button 
          leftIcon={<Icon as={FaUpload} />}
          colorScheme="purple" 
          onClick={() => fileInputRef.current.click()}
          flex="1"
        >
          Upload Image
        </Button>
        
        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          onChange={handleFileUpload}
          style={{ display: 'none' }}
        />
      </Flex>
      
      {capturedImage && (
        <Button 
          variant="outline" 
          colorScheme="red" 
          size="sm"
          onClick={() => {
            setCapturedImage(null);
            onImageCaptured(null);
          }}
        >
          Clear Image
        </Button>
      )}
    </VStack>
  );
};

export default ImageCapture;
