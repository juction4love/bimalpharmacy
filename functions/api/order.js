// १. POST रिक्वेस्ट (अर्डर लिने) ह्यान्डल गर्ने फङ्सन
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

    // ट्र्याकिङ नम्बर जेनेरेट गर्ने (उदाहरण: BML-48291)
    const randomId = Math.floor(10000 + Math.random() * 90000);
    const trackingNumber = `BML-${randomId}`;

    // (भविष्यमा हामी यहाँ डेटाबेसमा सेभ गर्ने कोड थप्नेछौँ)

    // फ्लटर एपलाई अर्डर सफल भएको जानकारी र ट्र्याकिङ नम्बर पठाउने
    return new Response(
      JSON.stringify({
        status: "success",
        message: "Order placed successfully at Bimal Pharmacy",
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
    return new Response(JSON.stringify({ error: "Server Error" }), {
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
