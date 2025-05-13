import React from "react";
import { Footer } from "flowbite-react";
import { Link } from "react-router-dom";
import { BsFacebook, BsInstagram, BsTwitter } from "react-icons/bs";
import { MdDeliveryDining } from "react-icons/md";

export default function FooterComp() {
  return (
    <Footer container className="border border-t-8 border-orange-500 dark:border-orange-700">
      <div className="w-full max-w-7xl mx-auto">
        <div className="grid w-full justify-between sm:flex md:grid-cols-1">
          <div className="mt-5">
            <Link
              to="/"
              className="self-center whitespace-nowrap text-lg sm:text-xl font-semibold dark:text-white flex items-center"
            >
              <MdDeliveryDining className="text-3xl mr-1 text-orange-500" />
              <span className="px-2 py-1 bg-gradient-to-r from-orange-500 to-red-600 dark:from-orange-600 dark:to-red-700 rounded-lg text-white font-bold">
                Flavour
              </span>
              <span className="font-bold text-orange-500 dark:text-orange-400 ml-1">Fleet</span>
            </Link>
            <p className="my-3 text-sm text-gray-600 dark:text-gray-400 max-w-xs">
              Delivering delicious food from the best restaurants near you, quickly and reliably.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-8 mt-4 sm:grid-cols-3 sm:gap-6">
            <div>
              <Footer.Title title="Explore" className="dark:text-white" />
              <Footer.LinkGroup col>
                <Footer.Link
                  href="/restaurants"
                  className="dark:text-gray-300 hover:text-orange-500 dark:hover:text-orange-400"
                >
                  All Restaurants
                </Footer.Link>
                <Footer.Link
                  href="/cuisines"
                  className="dark:text-gray-300 hover:text-orange-500 dark:hover:text-orange-400"
                >
                  Cuisines
                </Footer.Link>
                <Footer.Link
                  href="/promotions"
                  className="dark:text-gray-300 hover:text-orange-500 dark:hover:text-orange-400"
                >
                  Special Offers
                </Footer.Link>
              </Footer.LinkGroup>
            </div>

            <div>
              <Footer.Title title="Company" className="dark:text-white" />
              <Footer.LinkGroup col>
                <Footer.Link
                  href="/about"
                  className="dark:text-gray-300 hover:text-orange-500 dark:hover:text-orange-400"
                >
                  About Us
                </Footer.Link>
                <Footer.Link
                  href="/careers"
                  className="dark:text-gray-300 hover:text-orange-500 dark:hover:text-orange-400"
                >
                  Careers
                </Footer.Link>
                <Footer.Link
                  href="/contact-us"
                  className="dark:text-gray-300 hover:text-orange-500 dark:hover:text-orange-400"
                >
                  Contact Us
                </Footer.Link>
              </Footer.LinkGroup>
            </div>

            <div>
              <Footer.Title title="Legal" className="dark:text-white" />
              <Footer.LinkGroup col>
                <Footer.Link
                  href="/privacy"
                  className="dark:text-gray-300 hover:text-orange-500 dark:hover:text-orange-400"
                >
                  Privacy Policy
                </Footer.Link>
                <Footer.Link
                  href="/terms"
                  className="dark:text-gray-300 hover:text-orange-500 dark:hover:text-orange-400"
                >
                  Terms & Conditions
                </Footer.Link>
                <Footer.Link
                  href="/cookies"
                  className="dark:text-gray-300 hover:text-orange-500 dark:hover:text-orange-400"
                >
                  Cookie Policy
                </Footer.Link>
              </Footer.LinkGroup>
            </div>
          </div>
        </div>
        <Footer.Divider className="dark:border-gray-700" />
        <div className="w-full sm:flex sm:items-center sm:justify-between">
          <Footer.Copyright
            href="#"
            by="Flavour Fleet™"
            year={new Date().getFullYear()}
            className="dark:text-gray-300"
          />
          <div className="flex gap-6 sm:mt-0 mt-4 sm:justify-center">
            <Footer.Icon
              href="#"
              icon={BsFacebook}
              className="text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-500"
            />
            <Footer.Icon
              href="#"
              icon={BsInstagram}
              className="text-gray-500 hover:text-pink-600 dark:text-gray-400 dark:hover:text-pink-500"
            />
            <Footer.Icon
              href="#"
              icon={BsTwitter}
              className="text-gray-500 hover:text-blue-400 dark:text-gray-400 dark:hover:text-blue-300"
            />
          </div>
        </div>
      </div>
    </Footer>
  );
}