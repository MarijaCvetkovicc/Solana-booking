import * as anchor from "@project-serum/anchor";
import { useEffect, useMemo, useState } from "react";
import { ACCOMMODATION_PROGRAM_PUBKEY } from "../constants";

import accommodationIDL from "../constants/accommodation.json";
import { SystemProgram } from "@solana/web3.js";
import { utf8 } from "@project-serum/anchor/dist/cjs/utils/bytes";
import { findProgramAddressSync } from "@project-serum/anchor/dist/cjs/utils/pubkey";
import {
  useAnchorWallet,
  useConnection,
  useWallet,
} from "@solana/wallet-adapter-react";
import { authorFilter } from "../utils";
import { PublicKey } from "@solana/web3.js";
import { tr } from "date-fns/locale";
import { toast } from "react-hot-toast";

export const useAccommodation = () => {
  const { connection } = useConnection();
  const { publicKey } = useWallet();
  const anchorWalllet = useAnchorWallet();

  const [initialized, setInitialized] = useState(false);
  const [user, setUser] = useState({});

  const [transactionPending, setTransactionPending] = useState(false);
  const [loading, setLoading] = useState(false);

  const [accommodations, setAccommodations] = useState([]);
  const [lastAccommodation, setLastAccommodation] = useState(0);
  const [bookings, setBookings] = useState([]);
  const [lastBookId, setLastBookId] = useState(0);

  const program = useMemo(() => {
    if (anchorWalllet) {
      const provider = new anchor.AnchorProvider(
        connection,
        anchorWalllet,
        anchor.AnchorProvider.defaultOptions()
      );
      return new anchor.Program(
        accommodationIDL,
        ACCOMMODATION_PROGRAM_PUBKEY,
        provider
      );
    }
  }, [connection, anchorWalllet]);

  useEffect(() => {
    const start = async () => {
      if (program && publicKey && !transactionPending) {
        try {
          setLoading(true);

          const [profilePda] = await findProgramAddressSync(
            [utf8.encode("USER_STATE"), publicKey.toBuffer()],
            program.programId
          );
          const profileAccount = await program.account.userProfile.fetch(
            profilePda
          );
          if (profileAccount) {
            setLastAccommodation(profileAccount.lastAccommodation);
            setInitialized(true);

            const listings = await program.account.accommodationAccount.all();
            const allBookings = await program.account.bookingAccount.all();
            setUser(profileAccount.toString());
            setAccommodations(listings);

            const myBookings = allBookings.filter(
              (booking) =>
                booking.account.authority.toString() ==
                profileAccount.authority.toString()
            );

            setBookings(myBookings);
          } else {
            setInitialized(false);
          }
        } catch (error) {
          console.log(error);
          setInitialized(false);
        } finally {
          setLoading(false);
        }
      }
    };
    setLoading(true);
    const timer = setTimeout(() => {
      start();
    }, 1000);
    setLoading(false);
    return () => clearTimeout(timer);
  }, [publicKey, program, transactionPending]);

  const initializedUser = async () => {
    if (program && publicKey) {
      try {
        setTransactionPending(true);
        setLoading(true);
        const [profilePda] = findProgramAddressSync(
          [utf8.encode("USER_STATE"), publicKey.toBuffer()],
          program.programId
        );
        const tx = await program.methods
          .initializeUser()
          .accounts({
            userProfile: profilePda,
            authority: publicKey,
            systemProgram: SystemProgram.programId,
          })
          .rpc();
        toast.success("Successfully initialized user.");
        setInitialized(true);
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
        setTransactionPending(false);
      }
    }
  };

  const addAccommodation = async ({ location, country, price, imageURL }) => {
    if (program && publicKey) {
      setTransactionPending(true);
      setLoading(true);
      try {
        const [profilePda] = findProgramAddressSync(
          [utf8.encode("USER_STATE"), publicKey.toBuffer()],
          program.programId
        );
        const [accommodationPda] = findProgramAddressSync(
          [
            utf8.encode("ACCOMMODATION_STATE"),
            publicKey.toBuffer(),
            Uint8Array.from([lastAccommodation]),
          ],
          program.programId
        );

        await program.methods
          .addAccommodation(location, country, price, imageURL)
          .accounts({
            userProfile: profilePda,
            accommodationAccount: accommodationPda,
            authority: publicKey,
            systemProgram: SystemProgram.programId,
          })
          .rpc();
        toast.success("SUCCESSFULLY ADDED A LISTING");
      } catch (error) {
        console.error(error);
      } finally {
        setTransactionPending(false);
        setLoading(false);
      }
    }
  };

  const updateAccommodation = async ({
    accommodationPda,
    accommodationIdx,
    location,
    country,
    price,
    img,
  }) => {
    if (program && publicKey) {
      try {
        setLoading(true);
        setTransactionPending(true);
        const [profilePda] = findProgramAddressSync(
          [utf8.encode("USER_STATE"), publicKey.toBuffer()],
          program.programId
        );

        await program.methods
          .updateAccommodation(accommodationIdx, location, country, price, img)
          .accounts({
            userProfile: profilePda,
            accommodationAccount: accommodationPda,
            authority: publicKey,
            systemProgram: SystemProgram.programId,
          })
          .rpc();
        toast.success("Successfully EDIT Accommodation.");
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
        setTransactionPending(false);
      }
    }
  };
  const removeAccommodation = async (accommodationPda, accommodationIdx) => {
    if (program && publicKey) {
      try {
        setTransactionPending(true);
        setLoading(true);
        const [profilePda, profileBump] = findProgramAddressSync(
          [utf8.encode("USER_STATE"), publicKey.toBuffer()],
          program.programId
        );
        await program.methods
          .removeAccommodation(accommodationIdx)
          .accounts({
            userProfile: profilePda,
            accommodationAccount: accommodationPda,
            authority: publicKey,
            systemProgram: SystemProgram.programId,
          })
          .rpc();
        toast.success("Deleted listing");
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
        setTransactionPending(false);
      }
    }
  };

  const bookAccommodation = async ({ location, country, price, img }, date) => {
    const id = lastBookId + 1;
    if (program && publicKey) {
      try {
        setLoading(true);
        setTransactionPending(true);
        const [profilePda] = findProgramAddressSync(
          [utf8.encode("USER_STATE"), publicKey.toBuffer()],
          program.programId
        );
        const [bookPda] = findProgramAddressSync(
          [utf8.encode("BOOK_STATE"), publicKey.toBuffer()],
          program.programId
        );
        await program.methods
          .bookAccommodation(id, date, location, country, price, img)
          .accounts({
            userProfile: profilePda,
            bookingAccount: bookPda,
            authority: publicKey,
            systemProgram: SystemProgram.programId,
          })
          .rpc();
        toast.success("SUCCESSFULLY BOOOOOKED");
        setLastBookId(id);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
        setTransactionPending(false);
      }
    }
  };

  const cancelBooking = async (bookingPda, idx) => {
    if (program && publicKey) {
      try {
        setLoading(true);
        setTransactionPending(true);
        const [profilePda] = findProgramAddressSync(
          [utf8.encode("USER_STATE"), publicKey.toBuffer()],
          program.programId
        );
        await program.methods
          .cancelBooking(idx)
          .accounts({
            userProfile: profilePda,
            bookingAccount: bookingPda,
            authority: publicKey,
            systemProgram: SystemProgram.programId,
          })
          .rpc();
        toast.success("Canceled Booking");
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
        setTransactionPending(false);
      }
    }
  };

  return {
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
    loading,
  };
};
