import React from 'react';
import { 
  Box, Heading, Text, Progress, 
  SimpleGrid, Stat, StatLabel, 
  StatNumber, StatHelpText, 
  Badge, VStack, HStack
} from '@chakra-ui/react';

const SkinAnalysisDashboard = ({ analysisResults }) => {
  const { skinType, concerns, hydrationLevel, uvDamage } = analysisResults;
  
  const getSkinTypeColor = (type) => {
    switch(type) {
      case 'Dry': return 'red';
      case 'Oily': return 'green';
      case 'Combination': return 'purple';
      case 'Sensitive': return 'orange';
      default: return 'blue';
    }
  };
  
  const getHydrationColor = (level) => {
    if (level < 30) return 'red';
    if (level < 60) return 'yellow';
    return 'green';
  };
  
  const getUVDamageColor = (level) => {
    if (level > 70) return 'red';
    if (level > 40) return 'yellow';
    return 'green';
  };
  
  return (
    <Box>
      <Heading size="md" mb={6}>Your Skin Analysis Results</Heading>
      
      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
        <Stat bg="gray.50" p={4} borderRadius="md">
          <StatLabel>Skin Type</StatLabel>
          <HStack>
            <StatNumber>{skinType}</StatNumber>
            <Badge colorScheme={getSkinTypeColor(skinType)}>{skinType}</Badge>
          </HStack>
          <StatHelpText>
            {skinType === 'Dry' && 'Your skin tends to be flaky, itchy or rough'}
            {skinType === 'Oily' && 'Your skin often looks shiny and feels greasy'}
            {skinType === 'Combination' && 'Your skin has both oily and dry areas'}
            {skinType === 'Sensitive' && 'Your skin reacts easily to products and environmental factors'}
          </StatHelpText>
        </Stat>
        
        <Box bg="gray.50" p={4} borderRadius="md">
          <Text fontWeight="bold" mb={2}>Hydration Level</Text>
          <Progress 
            value={hydrationLevel} 
            colorScheme={getHydrationColor(hydrationLevel)} 
            size="lg"
            borderRadius="md"
          />
          <HStack justifyContent="space-between" mt={1}>
            <Text>{hydrationLevel}%</Text>
            <Badge colorScheme={getHydrationColor(hydrationLevel)}>
              {hydrationLevel < 30 ? 'Low' : hydrationLevel < 60 ? 'Moderate' : 'Good'}
            </Badge>
          </HStack>
        </Box>
        
        <Box bg="gray.50" p={4} borderRadius="md">
          <Text fontWeight="bold" mb={2}>UV Damage Risk</Text>
          <Progress 
            value={uvDamage} 
            colorScheme={getUVDamageColor(uvDamage)} 
            size="lg"
            borderRadius="md"
          />
          <HStack just
