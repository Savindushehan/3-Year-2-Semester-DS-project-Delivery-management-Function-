import React from 'react';
import { Button, Card } from 'flowbite-react';
import { 
  FaUtensils, 
  FaTruck, 
  FaUsers, 
  FaShieldAlt, 
  FaLeaf, 
  FaClock, 
  FaPhoneAlt, 
  FaEnvelope, 
  FaMapMarkerAlt,
  FaArrowRight
} from 'react-icons/fa';

export default function About() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-orange-500 to-red-600 dark:from-orange-700 dark:to-red-800 py-20 md:py-28">
        <div className="absolute inset-0 bg-black/10 backdrop-blur-sm"></div>
        <div className="relative container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-4 drop-shadow-lg">
              About Flavour Fleet
            </h1>
            <p className="text-xl md:text-2xl text-white opacity-90 mb-8 max-w-2xl mx-auto">
              Connecting food lovers with their favorite restaurants since 2023
            </p>
          </div>
        </div>
      
      </section>

      {/* Our Story */}
      <section className="container mx-auto px-4 py-16 md:py-24">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Our Story
            </h2>
            <div className="mx-auto w-24 h-1 bg-gradient-to-r from-orange-500 to-red-600 rounded-full mb-6"></div>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              From a small startup to your favorite food delivery service
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Founded in 2023, Flavour Fleet started with a simple mission: to bring the city's best food right to your doorstep. What began as a small team of food enthusiasts has grown into a network connecting thousands of restaurants with hungry customers across the country.
              </p>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Our journey hasn't always been easy, but our passion for great food and exceptional service has never wavered. Today, we're proud to be the bridge between amazing local restaurants and food lovers everywhere.
              </p>
              <p className="text-gray-600 dark:text-gray-300">
                With every delivery, we strive to make your day a little tastier and a lot more convenient. Because at Flavour Fleet, we believe good food should be just a few clicks away.
              </p>
            </div>
            <div className="relative">
              <img 
                src="https://images.unsplash.com/photo-1513104890138-7c749659a591?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80" 
                alt="Delicious food" 
                className="rounded-lg shadow-xl w-full object-cover h-80 md:h-96"
              />
              <div className="absolute -bottom-6 -left-6 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg">
                <p className="font-bold text-2xl text-orange-500">1000+</p>
                <p className="text-gray-600 dark:text-gray-300">Restaurant Partners</p>
              </div>
              <div className="absolute -top-6 -right-6 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg">
                <p className="font-bold text-2xl text-orange-500">50,000+</p>
                <p className="text-gray-600 dark:text-gray-300">Happy Customers</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Our Values */}
      <section className="bg-gray-100 dark:bg-gray-800 py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Our Values
            </h2>
            <div className="mx-auto w-24 h-1 bg-gradient-to-r from-orange-500 to-red-600 rounded-full mb-6"></div>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              The principles that guide everything we do at Flavour Fleet
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="flex flex-col items-center text-center hover:shadow-lg transition-shadow">
              <div className="p-4 bg-orange-100 dark:bg-orange-900 rounded-full mb-4">
                <FaUtensils className="h-8 w-8 text-orange-500" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Quality First</h3>
              <p className="text-gray-600 dark:text-gray-300">
                We partner with restaurants that share our passion for quality, ensuring every meal meets our high standards.
              </p>
            </Card>
            
            <Card className="flex flex-col items-center text-center hover:shadow-lg transition-shadow">
              <div className="p-4 bg-orange-100 dark:bg-orange-900 rounded-full mb-4">
                <FaClock className="h-8 w-8 text-orange-500" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Fast Delivery</h3>
              <p className="text-gray-600 dark:text-gray-300">
                We know hunger can't wait. Our efficient delivery network ensures your food arrives hot and fresh, every time.
              </p>
            </Card>
            
            <Card className="flex flex-col items-center text-center hover:shadow-lg transition-shadow">
              <div className="p-4 bg-orange-100 dark:bg-orange-900 rounded-full mb-4">
                <FaUsers className="h-8 w-8 text-orange-500" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Community Focus</h3>
              <p className="text-gray-600 dark:text-gray-300">
                We're proud to support local restaurants and contribute to the communities we serve.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="container mx-auto px-4 py-16 md:py-24">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              How Flavour Fleet Works
            </h2>
            <div className="mx-auto w-24 h-1 bg-gradient-to-r from-orange-500 to-red-600 rounded-full mb-6"></div>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Get your favorite food delivered in just a few simple steps
            </p>
          </div>
          
          <div className="space-y-12">
            {/* Step 1 */}
            <div className="flex flex-col md:flex-row items-center">
              <div className="order-2 md:order-1 md:w-1/2 p-6">
                <div className="bg-orange-100 dark:bg-orange-900 text-orange-500 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                  1
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Browse Restaurants</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Explore our extensive collection of partner restaurants. Filter by cuisine, distance, or ratings to find exactly what you're craving.
                </p>
              </div>
              <div className="order-1 md:order-2 md:w-1/2 mb-6 md:mb-0">
                <img 
                  src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" 
                  alt="Browsing restaurants" 
                  className="rounded-lg shadow-lg object-cover h-64 w-full"
                />
              </div>
            </div>
            
            {/* Step 2 */}
            <div className="flex flex-col md:flex-row items-center">
              <div className="order-2 md:w-1/2 mb-6 md:mb-0">
                <img 
                  src="https://images.unsplash.com/photo-1559715745-e1b33a271c8f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" 
                  alt="Creating order" 
                  className="rounded-lg shadow-lg object-cover h-64 w-full"
                />
              </div>
              <div className="order-1 md:w-1/2 p-6">
                <div className="bg-orange-100 dark:bg-orange-900 text-orange-500 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                  2
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Place Your Order</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Select your favorite dishes, customize as needed, and add them to your cart. Our easy checkout process makes ordering a breeze.
                </p>
              </div>
            </div>
            
            {/* Step 3 */}
            <div className="flex flex-col md:flex-row items-center">
              <div className="order-2 md:order-1 md:w-1/2 p-6">
                <div className="bg-orange-100 dark:bg-orange-900 text-orange-500 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                  3
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Track Your Delivery</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Watch in real-time as your order is prepared and delivered. Know exactly when your delicious food will arrive at your doorstep.
                </p>
              </div>
              <div className="order-1 md:order-2 md:w-1/2 mb-6 md:mb-0">
                <img 
                  src="https://images.unsplash.com/photo-1526367790999-0150786686a2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" 
                  alt="Tracking delivery" 
                  className="rounded-lg shadow-lg object-cover h-64 w-full"
                />
              </div>
            </div>
            
            {/* Step 4 */}
            <div className="flex flex-col md:flex-row items-center">
              <div className="order-2 md:w-1/2 mb-6 md:mb-0">
                <img 
                  src="https://images.unsplash.com/photo-1565299585323-38d6b0865b47?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" 
                  alt="Enjoying food" 
                  className="rounded-lg shadow-lg object-cover h-64 w-full"
                />
              </div>
              <div className="order-1 md:w-1/2 p-6">
                <div className="bg-orange-100 dark:bg-orange-900 text-orange-500 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                  4
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Enjoy & Rate</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Savor your meal and let us know how it was! Your feedback helps us and our restaurant partners continuously improve.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Get Started CTA */}
      <section className="bg-gradient-to-r from-orange-500 to-red-600 dark:from-orange-700 dark:to-red-800 py-16 relative overflow-hidden">
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Ready to Satisfy Your Cravings?
            </h2>
            <p className="text-xl text-white opacity-90 mb-8">
              Join thousands of food lovers who've discovered the convenience of Flavour Fleet
            </p>
            <Button 
              size="xl"
              href="/"
              className="bg-white hover:bg-gray-100 text-orange-600 font-bold py-3 px-8 rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
            >
              Order Now <FaArrowRight className="ml-2" />
            </Button>
          </div>
        </div>
        
        {/* Abstract shapes for visual interest */}
        <div className="absolute top-0 left-0 w-64 h-64 bg-white opacity-10 rounded-full -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-white opacity-10 rounded-full translate-x-1/3 translate-y-1/3"></div>
      </section>

      {/* Contact Information */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Get in Touch
            </h2>
            <div className="mx-auto w-24 h-1 bg-gradient-to-r from-orange-500 to-red-600 rounded-full mb-6"></div>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Have questions or feedback? We'd love to hear from you!
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="flex flex-col items-center text-center">
              <div className="p-4 bg-blue-100 dark:bg-blue-900 rounded-full mb-4">
                <FaPhoneAlt className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="font-bold text-gray-900 dark:text-white">Phone</h3>
              <p className="text-gray-600 dark:text-gray-300">(123) 456-7890</p>
              <p className="text-gray-600 dark:text-gray-300">Mon-Fri, 9am-6pm</p>
            </Card>
            
            <Card className="flex flex-col items-center text-center">
              <div className="p-4 bg-green-100 dark:bg-green-900 rounded-full mb-4">
                <FaEnvelope className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="font-bold text-gray-900 dark:text-white">Email</h3>
              <p className="text-gray-600 dark:text-gray-300">hello@flavourfleet.com</p>
              <p className="text-gray-600 dark:text-gray-300">support@flavourfleet.com</p>
            </Card>
            
            <Card className="flex flex-col items-center text-center">
              <div className="p-4 bg-purple-100 dark:bg-purple-900 rounded-full mb-4">
                <FaMapMarkerAlt className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="font-bold text-gray-900 dark:text-white">Address</h3>
              <p className="text-gray-600 dark:text-gray-300">123 Delivery Street</p>
              <p className="text-gray-600 dark:text-gray-300">Food City, FC 12345</p>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}