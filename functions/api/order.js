// १. POST रिक्वेस्ट (अर्डर लिने र पेमेन्ट जाँच्ने) ह्यान्डल गर्ने फङ्सन
export async function onRequestPost(context) {
  const { request } = context;

  try {
    // फ्लटर एपबाट पठाइएको JSON डेटा पढ्ने
    const orderData = await request.json();

    // डेटा खाली छ कि छैन भनेर जाँच्ने
    if (!orderData || !orderData.items) {
      return new Response(JSON.stringify({ error: "Invalid order data" }), {
        status: 400,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      });
    }

    // 🌟 इसेवा भेरिफिकेसन (यदि इसेवाबाट पेमेन्ट गरिएको हो भने मात्र यो चल्छ)
    // फ्लटर एपले पठाएको 'method' र 'transaction_token' (refId) जाँच्ने
    if (orderData.payment && orderData.payment.method === 'PaymentMethod.digitalWallet' && orderData.payment.transaction_token) {
      
      const ESEWA_MERCHANT_CODE = "EPAYTEST"; // लाइभ जाँदा यसलाई इसेवाले दिने सक्कली कोडले साट्नुहोस्
      const ESEWA_VERIFY_URL = "https://uat.esewa.com.np/epay/transrec"; // लाइभ जाँदा अगाडिको 'uat.' हटाउनुहोस्

      // इसेवालाई पठाउनुपर्ने विवरणहरू
      const verifyParams = new URLSearchParams({
        amt: orderData.payment.amount,
        rid: orderData.payment.transaction_token, // एपबाट आएको refId
        pid: orderData.payment.product_id,        // एपबाट आएको productId
        scd: ESEWA_MERCHANT_CODE
      });

      // इसेवाको सर्भरमा सोधपुछ गर्ने
      const verifyResponse = await fetch(`${ESEWA_VERIFY_URL}?${verifyParams.toString()}`, {
        method: 'GET'
      });

      const verifyText = await verifyResponse.text();

      // यदि इसेवाले 'Success' भनेन भने अर्डर फेल गरिदिने (सुरक्षा)
      if (!verifyText.toLowerCase().includes("success")) {
        return new Response(JSON.stringify({ error: "eSewa Payment Verification Failed! (पैसा प्राप्त भएन)" }), { 
          status: 400,
          headers: { 
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*" 
          }
        });
      }
    }

    // 🌟 अर्डर सफल भयो (COD वा Verified eSewa)
    // ट्र्याकिङ नम्बर जेनेरेट गर्ने (उदाहरण: BML-48291)
    const randomId = Math.floor(10000 + Math.random() * 90000);
    const trackingNumber = `BML-${randomId}`;

    // (भविष्यमा हामी यहाँ डेटाबेसमा सेभ गर्ने कोड थप्नेछौँ)

    // फ्लटर एपलाई अर्डर सफल भएको जानकारी पठाउने
    return new Response(
      JSON.stringify({
        status: "success",
        message: "Order placed and verified successfully at Bimal Pharmacy",
        tracking_number: trackingNumber,
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      }
    );
  } catch (error) {
    // कुनै गडबडी भएमा सर्भर एरर पठाउने
    return new Response(JSON.stringify({ error: "Server Error: " + error.message }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  }
}

// २. OPTIONS रिक्वेस्ट (CORS र Security को लागि अनिवार्य)
export async function onRequestOptions() {
  return new Response(null, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
