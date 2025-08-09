import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useState } from 'react';

import AdminAnalyticsScreen from './src/admin/AdminAnalyticsScreen'; // <-- ADD THIS LINE
import AdminDashboardScreen from './src/admin/AdminDashboardScreen';
import AdminLoginScreen from './src/admin/AdminLoginScreen';
import BookingsAdminScreen from './src/admin/BookingsAdminScreen';
import FeedbackManagementScreen from './src/admin/FeedbackManagementScreen';
import ItinerariesAdminScreen from './src/admin/ItinerariesAdminScreen';
import ItineraryRequestsAdminScreen from './src/admin/ItineraryRequestsAdminScreen';
import LocationAdminScreen from './src/admin/LocationAdminScreen';
import PartnersAdminScreen from './src/admin/PartnersAdminScreen';
import UsersAdminScreen from './src/admin/UsersAdminScreen';

import AboutUsScreen from './src/screens/AboutUsScreen';
import BookingScreen from './src/screens/BookingScreen';
import ContactUsScreen from './src/screens/ContactUsScreen';
import DashboardScreen from './src/screens/DashboardScreen';
import EcoPartnerScreen from './src/screens/EcoPartnerScreen';
import HomeScreen from './src/screens/HomeScreen';
import ItineraryScreen from './src/screens/ItineraryScreen';
import LoginScreen from './src/screens/LoginScreen';
import RecentBookingsScreen from './src/screens/RecentBookingsScreen';
import RegisterBusinessScreen from './src/screens/RegisterBusinessScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import TripPlannerScreen from './src/screens/TripPlannerScreen';
import ViewMyBusinessScreen from './src/screens/ViewMyBusinessScreen';

import FeedbackScreen from './src/screens/FeedbackScreen';
import MapScreen from './src/screens/MapScreen';
import TermsConditionsScreen from './src/screens/TermsConditionsScreen';

import AnalyticsScreen from './src/screens/AnalyticsScreen';
import BusinessProfileScreen from './src/screens/BusinessProfileScreen';
import CalendarScreen from './src/screens/CalendarScreen';
import NotificationsScreen from './src/screens/NotificationsScreen';
import PartnerSettingsScreen from './src/screens/PartnerSettingsScreen';
import ReviewsScreen from './src/screens/ReviewsScreen';
import ServicesScreen from './src/screens/ServicesScreen';
import MyBookingScreen from './src/screens/MyBookingScreen';

import MarketplaceScreen from './src/screens/MarketplaceScreen';
import ExploreLocationsScreen from './src/screens/ExploreLocationsScreen';
import HotelFilterScreen from './src/screens/HotelFilterScreen';

import { BusinessProvider } from './src/context/BusinessContext';

const Stack = createNativeStackNavigator();

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [itineraryData, setItineraryData] = useState({});
  const [business, setBusiness] = useState(null);

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Home">
          {(props) => (
            <HomeScreen {...props} isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} />
          )}
        </Stack.Screen>
        <Stack.Screen name="Login">
          {(props) => <LoginScreen {...props} setIsLoggedIn={setIsLoggedIn} setUser={setUser} />}
        </Stack.Screen>
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="ContactUs">
          {(props) => (
            <ContactUsScreen
              {...props}
              isLoggedIn={isLoggedIn}
              setIsLoggedIn={setIsLoggedIn}
            />
          )}
        </Stack.Screen>
        <Stack.Screen name="AboutUs">
          {(props) => (
            <AboutUsScreen {...props} isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} />
          )}
        </Stack.Screen>
        <Stack.Screen name="TermsConditions">
          {(props) => (
            <TermsConditionsScreen
              {...props}
              isLoggedIn={isLoggedIn}
              setIsLoggedIn={setIsLoggedIn}
            />
          )}
        </Stack.Screen>
        <Stack.Screen name="Dashboard">
          {(props) => (
            <DashboardScreen
              {...props}
              isLoggedIn={isLoggedIn}
              setIsLoggedIn={setIsLoggedIn}
              user={user}
            />
          )}
        </Stack.Screen>
        <Stack.Screen name="Map" component={MapScreen} />
        <Stack.Screen name="RecentBookings" component={RecentBookingsScreen} />
        <Stack.Screen name="TripPlanner">
          {(props) => (
            <TripPlannerScreen
              {...props}
              isLoggedIn={isLoggedIn}
              setIsLoggedIn={setIsLoggedIn}
              setItineraryData={setItineraryData}
            />
          )}
        </Stack.Screen>
        <Stack.Screen name="Booking">
          {(props) => (
            <BookingScreen {...props} isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} />
          )}
        </Stack.Screen>
        <Stack.Screen name="RegisterBusiness">
          {(props) => (
            <BusinessProvider>
              <RegisterBusinessScreen {...props} setBusiness={setBusiness} />
            </BusinessProvider>
          )}
        </Stack.Screen>
        <Stack.Screen name="ViewMyBusiness">
          {(props) => (
            <BusinessProvider>
              <ViewMyBusinessScreen {...props} business={business} />
            </BusinessProvider>
          )}
        </Stack.Screen>
        <Stack.Screen name="ItineraryScreen">
          {(props) => (
            <ItineraryScreen {...props} isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} />
          )}
        </Stack.Screen>
        <Stack.Screen name="AdminLogin">
          {(props) => <AdminLoginScreen {...props} setIsLoggedIn={setIsLoggedIn} />}
        </Stack.Screen>
        <Stack.Screen name="AdminDashboard">
          {(props) => (
            <AdminDashboardScreen {...props} isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} />
          )}
        </Stack.Screen>
       <Stack.Screen name="AdminAnalytics" component={AdminAnalyticsScreen} />
        <Stack.Screen name="BookingsAdmin" component={BookingsAdminScreen} />
        <Stack.Screen name="ItineraryRequestsAdmin" component={ItineraryRequestsAdminScreen} />
        <Stack.Screen name="ItinerariesAdmin" component={ItinerariesAdminScreen} />
        <Stack.Screen name="UsersAdmin" component={UsersAdminScreen} />
        <Stack.Screen name="PartnersAdmin">
          {(props) => <PartnersAdminScreen {...props} business={business} />}
        </Stack.Screen>
        <Stack.Screen name="LocationAdmin" component={LocationAdminScreen} />
        <Stack.Screen name="FeedbackManagement" component={FeedbackManagementScreen} />
        <Stack.Screen name="Feedback" component={FeedbackScreen} />
        <Stack.Screen name="EcoPartnerPortal" component={EcoPartnerScreen} />

        {/* EcoPartner feature screens */}
        <Stack.Screen name="BusinessProfile" component={BusinessProfileScreen} />
        <Stack.Screen name="Services" component={ServicesScreen} />
        <Stack.Screen name="Reviews" component={ReviewsScreen} />
        <Stack.Screen name="Analytics" component={AnalyticsScreen} />
        <Stack.Screen name="Calendar" component={CalendarScreen} />
        <Stack.Screen name="PartnerSettings" component={PartnerSettingsScreen} />
        <Stack.Screen name="Notifications" component={NotificationsScreen} />
        <Stack.Screen name="Bookings" component={MyBookingScreen}/>
        {/* NEW SCREENS */}
        <Stack.Screen name="Marketplace" component={MarketplaceScreen} />
        <Stack.Screen name="ExploreLocations" component={ExploreLocationsScreen} />
        <Stack.Screen name="HotelFilter" component={HotelFilterScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
