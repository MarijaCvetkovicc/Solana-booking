import Head from "next/head";
import Header from "../components/Header";
import Footer from "../components/Footer";
import FilterMenu from "../components/FilterMenu";
import Listings from "../components/Listing/Listings";
import { useMemo, useState, useEffect } from "react";
import AddListingModal from "../components/Listing/AddListingModal";
import EditListingModal from "../components/Listing/EditListingModal";
import ReserveListingModal from "../components/Listing/ReserveListingModal";
import { format } from "date-fns";
import { useWallet } from "@solana/wallet-adapter-react";
import { useAccommodation } from "../hooks/useAccommodation";
import Spinner from "@/components/Spinner";

export default function Home() {
  const { connected, publicKey } = useWallet();
  const {
    transactionPending,
    initialized,
    initializedUser,
    addAccommodation,
    accommodations,
    bookings,
    updateAccommodation,
    removeAccommodation,
    bookAccommodation,
    cancelBooking,
    loading
  } = useAccommodation();
  const [showReservedListing, setShowReservedListing] = useState(false);
  const [addListingModalOpen, setAddListingModalOpen] = useState(false);
  const [editListingModalOpen, setEditListingModalOpen] = useState(false);
  const [reserveListingModalOpen, setReserveListingModalOpen] = useState(false);
  const [currentEditListingID, setCurrentEditListingID] = useState(null);
  const [currentReserveListingID, setCurrentReserveListingID] = useState(null);
  const currentEditListing = useMemo(
    () =>
      accommodations.find(
        (listing) => listing.account.idx === currentEditListingID
      ),
    [currentEditListingID]
  );

  const currenReserveListing = useMemo(
    () =>
      accommodations.find(
        (listing) => listing.account.idx === currentReserveListingID
      ),
    [currentReserveListingID]
  );
  
  const displayListings = useMemo(
    () => (showReservedListing ? bookings : accommodations),
    [showReservedListing, accommodations]
  );

  const toggleShowReservedListing = () => {
    setShowReservedListing(!showReservedListing);
  };


  const toggleEditListingModal = (listingID) => {
    setCurrentEditListingID(listingID);

    setEditListingModalOpen(true);
  };


  const toggleReserveListingModal = (value, listingID) => {
    setCurrentReserveListingID(listingID);

    setReserveListingModalOpen(value);
  };

  return (
    <div>
      <Head>
        <title>Reserve Accomodation</title>
      </Head>
      <Header
        connected={connected}
        publicKey={publicKey}
        initialized={initialized}
        initializeUser={initializedUser}
        transactionPending={transactionPending}
      />
      <main className="pt-10 pb-20">
        {connected && (
          <div className="px-20 pb-10 flex justify-end space-x-4">
            <button
              onClick={toggleShowReservedListing}
              className="border rounded-lg p-4 text-xs font-medium"
            >
              {showReservedListing ? "Reserved" : "All"}
            </button>
            <button
              onClick={() => setAddListingModalOpen(true)}
              className="border rounded-lg p-4 text-xs font-medium"
            >
              Add Listing
            </button>
          </div>
        )}

       {!loading &&  <Listings
          connected={connected}
          showReservedListing={showReservedListing}
          listings={displayListings}
          toggleEditListingModal={toggleEditListingModal}
          toggleReserveListingModal={toggleReserveListingModal}
          removeListing={removeAccommodation}
          unreserveListing={cancelBooking}
        />}
        {loading && <Spinner/>}

        <AddListingModal
          addListing={addAccommodation}
          addListingModalOpen={addListingModalOpen}
          setAddListingModalOpen={setAddListingModalOpen}
        />
        <EditListingModal
          editListing={updateAccommodation}
          currentEditListing={currentEditListing}
          editListingModalOpen={editListingModalOpen}
          setEditListingModalOpen={setEditListingModalOpen}
        />
        <ReserveListingModal
          reserveListing={bookAccommodation}
          currenReserveListing={currenReserveListing}
          reserveListingModalOpen={reserveListingModalOpen}
          setReserveListingModalOpen={setReserveListingModalOpen}
        />
      </main>
      <Footer />
    </div>
  );
}
