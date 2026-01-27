const medicines = [
    // === ONCOLOGY (क्यान्सर सम्बन्धी) ===
    { 
        name: "Paclitaxel Injection (Taxol)", 
        category: "Oncology", 
        purpose: "स्तन, डिम्बाशय र फोक्सोको क्यान्सर", 
        side_effects: "कपाल झर्ने, जोर्नी दुख्ने, रगतको कमी", 
        price: "१०,००० - १५,००० (प्रति भायल)" 
    },
    { 
        name: "Imatinib 400mg (Gleevec)", 
        category: "Oncology", 
        purpose: "ब्लड क्यान्सर (CML) र आन्द्राको ट्युमर", 
        side_effects: "अनुहार सुन्निने, वाकवाकी, पखाला", 
        price: "२,५०० - ४,००० (१० चक्की)" 
    },
    { 
        name: "Trastuzumab (Herceptin)", 
        category: "Oncology", 
        purpose: "HER2-positive स्तन क्यान्सर", 
        side_effects: "मुटुको समस्या, ज्वरो, कमजोरी", 
        price: "५०,००० - ७०,००० (प्रति भायल)" 
    },
    { 
        name: "Tamoxifen 20mg", 
        category: "Oncology", 
        purpose: "हर्मोन-सम्बन्धी स्तन क्यान्सर", 
        side_effects: "गर्मी महसुस हुने (Hot flashes), महिनावारी गडबडी", 
        price: "१५० - २०० (१० चक्की)" 
    },
    { 
        name: "Cisplatin Injection", 
        category: "Oncology", 
        purpose: "मुत्रथैली र अण्डकोषको क्यान्सर", 
        side_effects: "मृगौलामा असर, बान्ता, सुन्ने शक्तिमा कमी", 
        price: "८०० - १,२०० (प्रति भायल)" 
    },
    { 
        name: "Capecitabine 500mg", 
        category: "Oncology", 
        purpose: "ठूलो आन्द्रा र स्तन क्यान्सर", 
        side_effects: "हात-खुट्टाको छाला निस्कने, पखाला", 
        price: "८०० - १,२०० (१० चक्की)" 
    },

    // === GENERAL MEDICINE (सामान्य औषधीहरू) ===
    { 
        name: "Napa 500mg (Paracetamol)", 
        category: "General", 
        purpose: "ज्वरो र सामान्य दुखाइ", 
        side_effects: "कलेजोमा असर (धेरै खाएमा), एलर्जी", 
        price: "१५ - २० (१० चक्की)" 
    },
    { 
        name: "Pantocid 40mg (Pantoprazole)", 
        category: "General", 
        purpose: "ग्यास्ट्रिक र छाती पोल्ने समस्या", 
        side_effects: "टाउको दुख्ने, पेट दुख्ने", 
        price: "८० - १२० (१० चक्की)" 
    },
    { 
        name: "Amoxicillin 500mg", 
        category: "General", 
        purpose: "ब्याक्टेरियल संक्रमण (घाँटी, छाला, दाँत)", 
        side_effects: "पखाला, दाग देखिने", 
        price: "७० - १०० (१० क्याप्सुल)" 
    },
    { 
        name: "Amlodipine 5mg", 
        category: "General", 
        purpose: "उच्च रक्तचाप (High BP)", 
        side_effects: "खुट्टा सुन्निने, थकाई लाग्ने", 
        price: "३० - ५० (१० चक्की)" 
    },
    { 
        name: "Metformin 500mg", 
        category: "General", 
        purpose: "सुगर (Diabetes) नियन्त्रण", 
        side_effects: "पेट गडबडी, धातुको स्वाद मुखमा आउने", 
        price: "४० - ६० (१० चक्की)" 
    },
    { 
        name: "Azithromycin 500mg", 
        category: "General", 
        purpose: "टाइफाइड र श्वासप्रश्वास संक्रमण", 
        side_effects: "बान्ता, पेट काट्ने", 
        price: "१२० - १५० (३ चक्की)" 
    }
    // ... यसरी नै ५०० सम्म थप्न सकिन्छ
];
