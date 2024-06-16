import {
  GlobeAmericasIcon,
  Bars3Icon,
  UserCircleIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/solid";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import Image from "next/image";
import { truncate } from "../utils/string";
require("@solana/wallet-adapter-react-ui/styles.css");

function Header({
  connected,
  publicKey,
  initializeUser,
  initialized,
  transactionPending,
}) {
  return (
    <header className="sticky top-0 transition-all md:grid md:grid-cols-3 items-center px-10 xl:px-20 py-4 z-50 bg-white border-b">
      <div className="flex-1 flex xl:justify-center px-6 transition-all duration-300">
        <button className="flex-1 flex items-center justify-between border rounded-full p-2 w-[300px] shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center divide-x">
            <p
              className="text-gray-800 bg-transparent text-sm font-medium px-4"
              type="text"
            >
              Anywhere
            </p>
            <p
              className="text-gray-800 bg-transparent text-sm font-medium px-4"
              type="text"
            >
              Any week
            </p>
            <p className="text-gray-600 bg-transparent text-sm font-light px-4">
              Add guests
            </p>
          </div>
          <MagnifyingGlassIcon className="h-8 w-8 bg-[#af38ff] text-white stroke-[3.5px] p-2 rounded-full" />
        </button>
      </div>

      <div className="flex items-center justify-end">
        <div className="border border-transparent cursor-pointer hover:bg-gray-100 rounded-full px-3 py-2">
          <a
            className="text-sm font-medium transition-all duration-300 text-gray-800"
            href="#"
          >
            Add your hotel
          </a>
        </div>

        <div className="border border-transparent cursor-pointer hover:bg-gray-100 rounded-full p-3">
          <GlobeAmericasIcon className="h-5 w-5 transition-all duration-300 text-gray-800" />
        </div>

        {initialized ? (
          <></>
        ) : (
          <button
            className="border border-transparent cursor-pointer hover:bg-gray-100 rounded-full p-3"
            onClick={() => initializeUser()}
            disabled={transactionPending}
          >
            initialize
          </button>
        )}
        <WalletMultiButton
          className="phantom-button"
          startIcon={
            <UserCircleIcon
              style={{ height: 32, width: 32, color: "#1f2937" }}
            />
          }
        >
          <span className="text-sm font-medium text-black">
            {connected ? truncate(publicKey.toString()) : "Connect wallet"}
          </span>
        </WalletMultiButton>
      </div>
    </header>
  );
}

export default Header;
