"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import localFont from "next/font/local";
import styles from "./sale.module.css";
import "./item.css";
import Spiner from "../spiner";
import HistoriesLoader from "../loaders";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import "../products/products.css";
import About from "../about";
import Funfact from "../facts/facts.jsx";
import Zoom from "react-medium-image-zoom";
import "react-medium-image-zoom/dist/styles.css";
import spiner from "../../app/images/sp.gif";
import Loading from "../loaders";
import { useRouter } from "next/navigation";
import { constants } from "buffer";
import added from "../../app/images/added.svg";
import Image from "next/image.js";
import { useRef } from "react";
import generatePDF from "react-to-pdf";

//import { useContext } from "react";
//import { AppContext } from '../../app/context'

const noir = localFont({
  src: [
    {
      path: "../../app/fonts/NoirPro-Light.ttf",
      weight: "200",
      style: "normal",
    },
    {
      path: "../../app/fonts/NoirPro-Regular.ttf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../app/fonts/NoirPro-Bold.ttf",
      weight: "700",
      style: "normal",
    },
    {
      path: "../../app/fonts/NoirPro-Medium.otf",
      weight: "500",
      style: "normal",
    },
  ],
});

const Index = () => {
  const [availableStores, setAvailableStores] = useState([]);
  const [selectedStore, setSelectedStore] = useState(null);
  const [locations, setLocations] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [selectedLocationsObject, setSelectedLocationsObject] = useState(null);
  const [responseData, setResponseData] = useState([]);
  const [isStoreAdded, setIsStoreAdded] = useState(false);
  const [loading, setLoading] = useState();
  const [namesss, setNamesss] = useState();
  const [image, setImage] = useState(false);
  const [firstTime, setFirstTime] = useState(true);
  const [special, setSpecial] = useState();

  

  const [addedToCart, setAddedToCart] = useState(
    Array(responseData.length).fill(false)
  );

  const [addedToCartImage, setAddedToCartImage] = useState(
    Array(responseData.length).fill(false)
  );
  const targetRef = useRef();

  React.useEffect(() => {
    window.addEventListener("storage", () => {
      //const theme = JSON.parse(localStorage.getItem('stores'))
      const sale = JSON.parse(localStorage.getItem("sale"));
      const responseData = JSON.parse(localStorage.getItem("responseData"));
      const special = JSON.parse(localStorage.getItem("special"));
      const names = JSON.parse(localStorage.getItem("names"));
      setNamesss(names);
      
      console.log(special);
      console.log(sale);
      console.log(responseData);
      console.log(sale);
      console.log(names);
      setSpecial(special);
      console.log(special);
      console.log(namesss)
      setSelectedStore(sale.store);
      setSelectedLocation(sale.location);
      setResponseData(responseData);
      // if (names === null && special) {
      //   console.log("noooooo");
      //   setAddedToCartImage(Array(responseData.length).fill(false))
      // }
      console.log(addedToCartImage);
    });
  }, [selectedLocation,namesss]);

  React.useEffect(() => {
    window.addEventListener("storage", () => {
      if (namesss === null && special) {
        console.log("noooooo");
        setAddedToCartImage(Array(responseData.length).fill(false))
      }
    });
  }, [namesss]);

  useEffect(() => {
    // Function to handle changes in localStorage
    const handleStorageChange = () => {
      const sale = JSON.parse(localStorage.getItem("sale"));
      const storedResponseData = JSON.parse(
        localStorage.getItem("responseData")
      );
      if (sale) {
        setSelectedStore(sale.store);
        handleStoreChange(sale.store);
        setSelectedLocation(sale.location);
      }
      if (storedResponseData) {
        setResponseData(storedResponseData);
      }
    };

    // Initial setup from localStorage
    handleStorageChange();

    // Listen for changes in localStorage
    window.addEventListener("storage", handleStorageChange);

    // Cleanup function
    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  useEffect(() => {
    axios
      .get("http://localhost:8080/api/stores")
      .then((response) => {
        setAvailableStores(response.data);
      })
      .catch((error) => {
        console.error("Error fetching available stores:", error);
      });
  }, []);

  const handleStoreChange = async (selectedStore) => {
    setSelectedStore(selectedStore);
    try {
      const response = await axios.get(
        `http://localhost:8080/api/stores/${selectedStore}`
      );

      if (response.status === 200) {
        const locationsObject = response.data.locations;
        const locationsArray = Object.keys(locationsObject);
        setLocations(locationsArray);
        setSelectedLocationsObject(locationsObject);

        console.log(locationsObject);
      } else {
        console.error(
          `Error fetching locations. Server returned: ${response.status}`
        );
      }
    } catch (error) {
      console.error("Error fetching locations:", error.message);
    }
  };

  const handleAddStore = async () => {
    setLoading(true);
    if (!selectedLocation) {
      console.warn("Please select a location before adding.");
      return;
    }

    const newSelectedLocationValue = selectedLocationsObject[selectedLocation];

    console.log(newSelectedLocationValue);
    const newStoreLocationObject = {
      store: selectedStore,
      location: selectedLocation,
      id: newSelectedLocationValue,
    };

    const storesNames = JSON.parse(localStorage.getItem("storesName")) || [];
    if (!storesNames.includes(newStoreLocationObject)) {
      storesNames.push(newStoreLocationObject);
      localStorage.setItem("storesName", JSON.stringify(storesNames));
    }

    console.log(newStoreLocationObject);

    const saveCartData = (newStoreLocationObject) => {
      localStorage.setItem("sale", JSON.stringify(newStoreLocationObject));
    };
    saveCartData(newStoreLocationObject);
    const storedData = JSON.parse(localStorage.getItem("sale"));
    console.log(storedData);
    setSelectedStore(storedData.store);
    setSelectedLocation(storedData.location);
    console.log(selectedStore);
    try {
      const response = await axios.post("http://localhost:8080/api/sale", {
        selectedStoresID: [newSelectedLocationValue],
      });
      // Assuming the response contains the data you need
      const storesData = response.data;
      setResponseData(storesData);
      //setResponseData(storesData);
      console.log(responseData);
      const dataToLocalStorage = localStorage.setItem(
        "responseData",
        JSON.stringify(storesData)
      );
      window.dispatchEvent(new Event("storage"));

      const handleAddToCart = (index) => {
        const arrayOfItems = [];
        const selectedItem = storesData[index];
        const ItemCode = selectedItem.code;
        localStorage.setItem("storedField", ItemCode);
      };
      //console.log(storesData);
      setLoading(false);q
      setFirstTime(false);
      saveCartData(newStoreLocationObject);
    } catch (error) {
      console.error("Error fetching stores data:", error.message);
      // Handle the error (display a message to the user, log it, etc.)
    }

    // Reset selected location for the next selection
    //setSelectedLocation(null);
  };

  useEffect(() => {
    const handleBeforeUnload = () => {
      localStorage.clear();
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  // const handleAddToCart = (index)=>{
  //   const arrayOfItems = [];
  //   const selectedItem = responseData[index];
  //   const ItemCode = selectedItem.code;
  //   arrayOfItems.push(ItemCode)
  //   localStorage.setItem('storedField', arrayOfItems);
  // }

  const handleAddToCart = (item, index) => {
    // Retrieve existing items from localStorage or initialize an empty array
    const existingItems = JSON.parse(localStorage.getItem("cart")) || [];
    const existingStores = JSON.parse(localStorage.getItem("stores")) || [];
    const title = JSON.parse(localStorage.getItem("names")) || [];
    // Get the selected item from the responseData based on the index
    const selectedItem = responseData[index];

    // Extract the desired data from the selectedItem (assuming it has a code property)
    const itemCode = selectedItem.code;
    const name = selectedItem.name;
    title.push(name);
    localStorage.setItem("names", JSON.stringify(title));
    //const storeCode = parseInt(selectedItem.storeID, 10);
    const updatedAddedToCart = [...addedToCart];
    updatedAddedToCart[index] = true;
    setAddedToCart(updatedAddedToCart);
    const updatedAddedToCartImage = [...addedToCartImage];
    updatedAddedToCartImage[index] = true;
    setAddedToCartImage(updatedAddedToCartImage);
    localStorage.setItem("special", JSON.stringify(updatedAddedToCartImage));

    setTimeout(() => {
      const resetAddedToCart = [...updatedAddedToCart];
      resetAddedToCart[index] = false;
      setAddedToCart(resetAddedToCart);
    }, 1000);
    // // Add the item code to the existing array of items
    // existingItems.push(itemCode);

    // // Save the updated array back to localStorage
    // localStorage.setItem('cart', JSON.stringify(existingItems));

    if (!existingStores.includes(selectedItem.storeID)) {
      // Add the item code to the existing array of items
      existingStores.push(selectedItem.storeID);
      // Save the updated array back to localStorage
      localStorage.setItem("stores", JSON.stringify(existingStores));
      window.dispatchEvent(new Event("storage"));
    } else {
      console.log("Item already exists in the cart.");
    }

    // if (!existingItems.includes(itemCode)) {
    //   // Add the item code to the existing array of items
    existingItems.push(itemCode);
    // Save the updated array back to localStorage
    localStorage.setItem("cart", JSON.stringify(existingItems));
    window.dispatchEvent(new Event("storage"));
    // } else {
    //   console.log("Item already exists in the cart.");
    // }
    localStorage.setItem("cart", JSON.stringify(existingItems));
    localStorage.setItem("stores", JSON.stringify(existingStores));
  };

  console.log(responseData);

  const undefinedAisleCount = responseData.filter(
    (item) => item.aisle === undefined
  ).length;
  const fishAisleCount = responseData.filter(
    (item) => item.aisle === "Fish & Seafood"
  ).length;
  const fruitsAisleCount = responseData.filter(
    (item) => item.aisle === "Fruits & Vegetables"
  ).length;
  const snacksAisleCount = responseData.filter(
    (item) => item.aisle === "Snacks, Chips & Candy"
  ).length;
  const dairyAisleCount = responseData.filter(
    (item) => item.aisle === "Dairy & Eggs"
  ).length;
  const drinksAisleCount = responseData.filter(
    (item) => item.aisle === "Drinks"
  ).length;
  const bakeryAisleCount = responseData.filter(
    (item) => item.aisle === "Bakery"
  ).length;
  const deliAisleCount = responseData.filter(
    (item) => item.aisle === "Deli"
  ).length;
  const meatAisleCount = responseData.filter(
    (item) => item.aisle === "Meat"
  ).length;
  const frozenAisleCount = responseData.filter(
    (item) => item.aisle === "Frozen"
  ).length;

  const houseAisleCount = responseData.filter(
    (item) => item.aisle === "Household Supplies"
  ).length;

  return (
    <div
      style={{ marginLeft: "80px", marginRight: "80px", paddingTop: "10px" }}
    >
      <h1
        style={{
          textAlign: "center",
          paddingBottom: "0px",
          marginBottom: "0px",
        }}
        className={noir.className}
      >
        Special Price
      </h1>
      <p
        style={{
          textAlign: "center",
          paddingTop: "0px",
          marginTop: "0px",
          paddingBottom: "18px",
        }}
        className={noir.className}
      >
        Select the stores you'd like to compare prices for various products
      </p>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <label
          style={{
            paddingRight: "8px",
            fontSize: "18px",
            paddingLeft: "24px",
          }}
          className={noir.className}
        >
          Select Store:
        </label>
        <select
          className={noir.className}
          style={{
            width: "232px",
            height: "38px",
            padding: "0.375rem 2.25rem 0.375rem 0.75rem",
            fontSize: "1rem",
            fontWeight: "400",
            lineHeight: "1.5",
            color: "#212529",
            backgroundColor: "#fff",
            border: "1px solid #ced4da",
            borderRadius: "0.25rem",
            transition:
              "border-color .15s ease-in-out,box-shadow .15s ease-in-out",
          }}
          onChange={(e) => handleStoreChange(e.target.value)}
          value={selectedStore}
        >
          <option
            style={{ color: "#212529" }}
            value=""
            disabled
            selected
            hidden
            className={noir.className}
          >
            Please Choose Store...
          </option>
          {availableStores.map((store) => (
            <option className={noir.className} key={store} value={store}>
              {store}
            </option>
          ))}
        </select>
        {selectedStore !== null && (
          <>
            <label
              style={{
                paddingRight: "8px",
                fontSize: "18px",
                paddingLeft: "24px",
              }}
              className={noir.className}
            >
              Select Location:
            </label>
            <select
              className={noir.className}
              style={{
                height: "38px",
                padding: "0.375rem 0.25rem 0.375rem 0.75rem",
                fontSize: "1rem",
                fontWeight: "400",
                lineHeight: "1.5",
                color: "#212529",
                backgroundColor: "#fff",
                border: "1px solid #ced4da",
                borderRadius: "0.25rem",
                transition:
                  "border-color .15s ease-in-out,box-shadow .15s ease-in-out",
              }}
              onChange={(e) => setSelectedLocation(e.target.value)}
              value={selectedLocation}
            >
              <option
                value=""
                disabled
                selected
                hidden
                className={noir.className}
              >
                Please Choose Location
              </option>
              <option
                value={selectedLocation}
                selected
                hidden
                className={noir.className}
              >
                {selectedLocation}
              </option>
              {locations.map((location, index) => (
                <option
                  className={noir.className}
                  key={location}
                  value={location}
                >
                  {location}
                </option>
              ))}
            </select>
          </>
        )}
        {selectedLocation !== null && (
          <button
            className={noir.className}
            style={{
              outline: "0",
              height: "38px",
              marginLeft: "20px",
              padding: "5px 16px",
              fontSize: "14px",
              fontWeight: "500",
              lineHeight: "20px",
              verticalAlign: "middle",
              border: "1px solid",
              borderRadius: " 6px",
              color: " #24292e",
              backgroundColor: "#fafbfc",
              borderColor: "#1b1f2326",
              boxShadow:
                "rgba(27, 31, 35, 0.04) 0px 1px 0px 0px, rgba(255, 255, 255, 0.25) 0px 1px 0px 0px inset",
              transition: "0.2s cubic-bezier(0.3, 0, 0.5, 1)",
            }}
            onClick={handleAddStore}
          >
            Search
          </button>
        )}
      </div>
      {selectedStore !== null &&
      selectedLocation !== null &&
      responseData.length !== 0 ? (
        <div style={{ overflowX: "auto", minWidth: "100%", marginTop: "32px" }}>
          {loading ? (
            <Skeleton />
          ) : (
            <>
              <div
                style={{
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <a className={`${noir.className} links`} href="#part1">
                  Fruits & Vegetables
                </a>
                <a className={`${noir.className} links`} href="#part2">
                  Snacks, Chips & Candy
                </a>
                <a className={`${noir.className} links`} href="#part3">
                  Dairy & Eggs
                </a>
                <a className={`${noir.className} links`} href="#part4">
                  Drinks
                </a>
                <a className={`${noir.className} links`} href="#part5">
                  Bakery
                </a>
                <a className={`${noir.className} links`} href="#part6">
                  Deli
                </a>
                <a className={`${noir.className} links`} href="#part7">
                  Meat
                </a>
                <a className={`${noir.className} links`} href="#part8">
                  Fish & Seafood
                </a>
                <a className={`${noir.className} links`} href="#part9">
                  Frozen
                </a>
                <a className={`${noir.className} links`} href="#part10">
                  Other products
                </a>
              </div>
              <h2 id="part1" className={noir.className}>
                Fruits & Vegetables
              </h2>
            </>
          )}
          <ul
            className="product-list"
            style={{ display: "flex", flexDirection: "row", flexWrap: "wrap" }}
          >
            {responseData &&
              responseData.map(
                (item, index) =>
                  item.aisle === "Fruits & Vegetables" && (
                    <li key={index} tabIndex="-1" className="product-list-item">
                      <div className="product-container">
                        <div className="product-info-container">
                          <div className="product-image-container">
                            {loading ? (
                              <Skeleton width={110} height={110} />
                            ) : (
                              <>
                                <div style={{ height: "35px" }}>
                                  {namesss && namesss.length > 0 && addedToCartImage[index] ? (
                                    <Image
                                      style={{ paddingLeft: "90px" }}
                                      width={35}
                                      height={35}
                                      src={added}
                                    />
                                  ) : (
                                    null
                                  )}
                                </div>
                                <Zoom zoomZindex={1}>
                                  <img
                                    alt="skksks"
                                    src={item.image}
                                    //loading="lazy"
                                    className="product-image"
                                    //aria-hidden="true"
                                  />
                                </Zoom>
                              </>
                            )}
                          </div>
                          <div
                            className="price-container"
                            data-testid="price-product-tile"
                          >
                            {loading ? (
                              <Skeleton width={70} height={16} />
                            ) : (
                              <p
                                className={`${noir.className} price-paragraph`}
                                data-testid="price"
                              >
                                ${item.prices.price}
                                {item.prices.wasPrice && (
                                  <s
                                    style={{
                                      marginRight: "10px",
                                      marginBottom: "5px",
                                    }}
                                  >
                                    ({item.prices.wasPrice})
                                  </s>
                                )}
                              </p>
                            )}
                          </div>
                          {/* <a href="lalal" className="link-box-overlay"> */}
                          <div className="overlay-container">
                            {loading ? (
                              <Skeleton width={154} height={12} />
                            ) : (
                              <p
                                className={`${noir.className} product-brand-paragraph`}
                                data-testid="product-brand"
                              >
                                {item.brand}
                              </p>
                            )}
                            {loading ? (
                              <Skeleton width={154} height={12} />
                            ) : (
                              <h3
                                className={`${noir.className} product-title-heading`}
                                data-testid="product-title"
                              >
                                {item.name}
                              </h3>
                            )}
                            {loading ? (
                              <Skeleton width={154} height={12} />
                            ) : (
                              <p
                                className="package-size-paragraph"
                                data-testid="product-package-size"
                              >
                                {item.prices.size == ""
                                  ? "$" +
                                    (item.prices.unitPriceValue * 10).toFixed(
                                      2
                                    ) +
                                    " / 1" +
                                    " " +
                                    "kg"
                                  : item.prices.size}
                              </p>
                            )}
                          </div>
                        </div>
                        {loading ? (
                          <Skeleton />
                        ) : (
                          <button
                            onClick={() => handleAddToCart(item, index)}
                            className={`${noir.className} box`}
                            style={{
                              outline: "0",
                              height: "38px",
                              cursor: "pointer",
                              padding: "5px 16px",
                              fontSize: "14px",
                              fontWeight: "500",
                              lineHeight: "20px",
                              verticalAlign: "middle",
                              border: "1px solid",
                              borderRadius: " 6px",
                              color: " #24292e",
                              backgroundColor: "#fafbfc",
                              borderColor: "#1b1f2326",
                              transition: "0.2s cubic-bezier(0.3, 0, 0.5, 1)",
                            }}
                          >
                            {addedToCart[index]
                              ? "Added to cart"
                              : "Add to Cart"}
                          </button>
                        )}
                      </div>
                    </li>
                  )
              )}
          </ul>
          {loading ? (
            <Skeleton />
          ) : (
            <h2 id="part2" className={noir.className}>
              Snacks, Chips & Candy
            </h2>
          )}
          <ul
            className="product-list"
            style={{ display: "flex", flexDirection: "row", flexWrap: "wrap" }}
          >
            {responseData &&
              responseData.map(
                (item, index) =>
                  item.aisle === "Snacks, Chips & Candy" && (
                    <li key={index} tabIndex="-1" className="product-list-item">
                      <div className="product-container">
                        <div className="product-info-container">
                          <div className="product-image-container">
                            {loading ? (
                              <Skeleton width={110} height={110} />
                            ) : (
                              <>
                                <div style={{ height: "35px" }}>
                                  {addedToCartImage[index] ? (
                                    <Image
                                      style={{ paddingLeft: "90px" }}
                                      width={35}
                                      height={35}
                                      src={added}
                                    />
                                  ) : (
                                    " "
                                  )}
                                </div>
                                <Zoom>
                                  <img
                                    alt="skksks"
                                    src={item.image}
                                    //loading="lazy"
                                    className="product-image"
                                    //aria-hidden="true"
                                  />
                                </Zoom>
                              </>
                            )}
                          </div>
                          <div
                            className="price-container"
                            data-testid="price-product-tile"
                          >
                            {loading ? (
                              <Skeleton width={70} height={16} />
                            ) : (
                              <p
                                className={`${noir.className} price-paragraph`}
                                data-testid="price"
                              >
                                ${item.prices.price}
                                {item.prices.wasPrice && (
                                  <s
                                    style={{
                                      marginRight: "10px",
                                      marginBottom: "5px",
                                    }}
                                  >
                                    ({item.prices.wasPrice})
                                  </s>
                                )}
                              </p>
                            )}
                          </div>
                          {/* <a href="lalal" className="link-box-overlay"> */}
                          <div className="overlay-container">
                            {loading ? (
                              <Skeleton width={154} height={12} />
                            ) : (
                              <p
                                className={`${noir.className} product-brand-paragraph`}
                                data-testid="product-brand"
                              >
                                {item.brand}
                              </p>
                            )}
                            {loading ? (
                              <Skeleton width={154} height={12} />
                            ) : (
                              <h3
                                className={`${noir.className} product-title-heading`}
                                data-testid="product-title"
                              >
                                {item.name}
                              </h3>
                            )}
                            {loading ? (
                              <Skeleton width={154} height={12} />
                            ) : (
                              <p
                                className="package-size-paragraph"
                                data-testid="product-package-size"
                              >
                                {item.prices.size == ""
                                  ? "$" +
                                    (item.prices.unitPriceValue * 10).toFixed(
                                      2
                                    ) +
                                    " / 1" +
                                    " " +
                                    "kg"
                                  : item.prices.size}
                              </p>
                            )}
                          </div>
                        </div>
                        {loading ? (
                          <Skeleton />
                        ) : (
                          <button
                            onClick={() => handleAddToCart(item, index)}
                            className={`${noir.className} box`}
                            style={{
                              outline: "0",
                              cursor: "pointer",
                              padding: "5px 16px",
                              fontSize: "14px",
                              fontWeight: "500",
                              lineHeight: "20px",
                              verticalAlign: "middle",
                              border: "1px solid",
                              borderRadius: " 6px",
                              color: " #24292e",
                              backgroundColor: "#fafbfc",
                              borderColor: "#1b1f2326",
                              transition: "0.2s cubic-bezier(0.3, 0, 0.5, 1)",
                            }}
                          >
                            {addedToCart[index]
                              ? "Added to cart"
                              : "Add to Cart"}
                          </button>
                        )}
                      </div>
                    </li>
                  )
              )}
          </ul>
          {loading ? (
            <Skeleton />
          ) : (
            <h2 id="part3" className={noir.className}>
              Dairy & Eggs
            </h2>
          )}
          <ul
            className="product-list"
            style={{ display: "flex", flexDirection: "row", flexWrap: "wrap" }}
          >
            {responseData &&
              responseData.map(
                (item, index) =>
                  item.aisle === "Dairy & Eggs" && (
                    <li key={index} tabIndex="-1" className="product-list-item">
                      <div className="product-container">
                        <div className="product-info-container">
                          <div className="product-image-container">
                            {loading ? (
                              <Skeleton width={110} height={110} />
                            ) : (
                              <>
                                <div style={{ height: "35px" }}>
                                  {addedToCartImage[index] ? (
                                    <Image
                                      style={{ paddingLeft: "90px" }}
                                      width={35}
                                      height={35}
                                      src={added}
                                    />
                                  ) : (
                                    " "
                                  )}
                                </div>
                                <Zoom>
                                  <img
                                    alt="skksks"
                                    src={item.image}
                                    //loading="lazy"
                                    className="product-image"
                                    //aria-hidden="true"
                                  />
                                </Zoom>
                              </>
                            )}
                          </div>
                          <div
                            className="price-container"
                            data-testid="price-product-tile"
                          >
                            {loading ? (
                              <Skeleton width={70} height={16} />
                            ) : (
                              <p
                                className={`${noir.className} price-paragraph`}
                                data-testid="price"
                              >
                                ${item.prices.price}
                                {item.prices.wasPrice && (
                                  <s
                                    style={{
                                      marginRight: "10px",
                                      marginBottom: "5px",
                                    }}
                                  >
                                    ({item.prices.wasPrice})
                                  </s>
                                )}
                              </p>
                            )}
                          </div>
                          {/* <a href="lalal" className="link-box-overlay"> */}
                          <div className="overlay-container">
                            {loading ? (
                              <Skeleton width={154} height={12} />
                            ) : (
                              <p
                                className={`${noir.className} product-brand-paragraph`}
                                data-testid="product-brand"
                              >
                                {item.brand}
                              </p>
                            )}
                            {loading ? (
                              <Skeleton width={154} height={12} />
                            ) : (
                              <h3
                                className={`${noir.className} product-title-heading`}
                                data-testid="product-title"
                              >
                                {item.name}
                              </h3>
                            )}
                            {loading ? (
                              <Skeleton width={154} height={12} />
                            ) : (
                              <p
                                className="package-size-paragraph"
                                data-testid="product-package-size"
                              >
                                {item.prices.size == ""
                                  ? "$" +
                                    (item.prices.unitPriceValue * 10).toFixed(
                                      2
                                    ) +
                                    " / 1" +
                                    " " +
                                    "kg"
                                  : item.prices.size}
                              </p>
                            )}
                          </div>
                        </div>
                        {loading ? (
                          <Skeleton />
                        ) : (
                          <button
                            onClick={() => handleAddToCart(item, index)}
                            className={`${noir.className} box`}
                            style={{
                              outline: "0",
                              cursor: "pointer",
                              padding: "5px 16px",
                              fontSize: "14px",
                              fontWeight: "500",
                              lineHeight: "20px",
                              verticalAlign: "middle",
                              border: "1px solid",
                              borderRadius: " 6px",
                              color: " #24292e",
                              backgroundColor: "#fafbfc",
                              borderColor: "#1b1f2326",
                              transition: "0.2s cubic-bezier(0.3, 0, 0.5, 1)",
                            }}
                          >
                            {addedToCart[index]
                              ? "Added to cart"
                              : "Add to Cart"}
                          </button>
                        )}
                      </div>
                    </li>
                  )
              )}
          </ul>
          {loading ? (
            <Skeleton />
          ) : (
            <h2 id="part4" className={noir.className}>
              Drinks
            </h2>
          )}
          <ul
            className="product-list"
            style={{ display: "flex", flexDirection: "row", flexWrap: "wrap" }}
          >
            {responseData &&
              responseData.map(
                (item, index) =>
                  item.aisle === "Drinks" && (
                    <li key={index} tabIndex="-1" className="product-list-item">
                      <div className="product-container">
                        <div className="product-info-container">
                          <div className="product-image-container">
                            {loading ? (
                              <Skeleton width={110} height={110} />
                            ) : (
                              <>
                                <div style={{ height: "35px" }}>
                                  {addedToCartImage[index] ? (
                                    <Image
                                      style={{ paddingLeft: "90px" }}
                                      width={35}
                                      height={35}
                                      src={added}
                                    />
                                  ) : (
                                    " "
                                  )}
                                </div>
                                <Zoom>
                                  <img
                                    alt="skksks"
                                    src={item.image}
                                    //loading="lazy"
                                    className="product-image"
                                    //aria-hidden="true"
                                  />
                                </Zoom>
                              </>
                            )}
                          </div>
                          <div
                            className="price-container"
                            data-testid="price-product-tile"
                          >
                            {loading ? (
                              <Skeleton width={70} height={16} />
                            ) : (
                              <p
                                className={`${noir.className} price-paragraph`}
                                data-testid="price"
                              >
                                ${item.prices.price}
                                {item.prices.wasPrice && (
                                  <s
                                    style={{
                                      marginRight: "10px",
                                      marginBottom: "5px",
                                    }}
                                  >
                                    ({item.prices.wasPrice})
                                  </s>
                                )}
                              </p>
                            )}
                          </div>
                          {/* <a href="lalal" className="link-box-overlay"> */}
                          <div className="overlay-container">
                            {loading ? (
                              <Skeleton width={154} height={12} />
                            ) : (
                              <p
                                className={`${noir.className} product-brand-paragraph`}
                                data-testid="product-brand"
                              >
                                {item.brand}
                              </p>
                            )}
                            {loading ? (
                              <Skeleton width={154} height={12} />
                            ) : (
                              <h3
                                className={`${noir.className} product-title-heading`}
                                data-testid="product-title"
                              >
                                {item.name}
                              </h3>
                            )}
                            {loading ? (
                              <Skeleton width={154} height={12} />
                            ) : (
                              <p
                                className="package-size-paragraph"
                                data-testid="product-package-size"
                              >
                                {item.prices.size == ""
                                  ? "$" +
                                    (item.prices.unitPriceValue * 10).toFixed(
                                      2
                                    ) +
                                    " / 1" +
                                    " " +
                                    "kg"
                                  : item.prices.size}
                              </p>
                            )}
                          </div>
                        </div>
                        {loading ? (
                          <Skeleton />
                        ) : (
                          <button
                            onClick={() => handleAddToCart(item, index)}
                            className={`${noir.className} box`}
                            style={{
                              outline: "0",
                              cursor: "pointer",
                              padding: "5px 16px",
                              fontSize: "14px",
                              fontWeight: "500",
                              lineHeight: "20px",
                              verticalAlign: "middle",
                              border: "1px solid",
                              borderRadius: " 6px",
                              color: " #24292e",
                              backgroundColor: "#fafbfc",
                              borderColor: "#1b1f2326",
                              transition: "0.2s cubic-bezier(0.3, 0, 0.5, 1)",
                            }}
                          >
                            {addedToCart[index]
                              ? "Added to cart"
                              : "Add to Cart"}
                          </button>
                        )}
                      </div>
                    </li>
                  )
              )}
          </ul>
          {bakeryAisleCount > 0 && (
            <>
              {loading ? (
                <Skeleton />
              ) : (
                <h2 id="part5" className={noir.className}>
                  Bakery
                </h2>
              )}
              <ul
                className="product-list"
                style={{
                  display: "flex",
                  flexDirection: "row",
                  flexWrap: "wrap",
                }}
              >
                {responseData &&
                  responseData.map(
                    (item, index) =>
                      item.aisle === "Bakery" && (
                        <li
                          key={index}
                          tabIndex="-1"
                          className="product-list-item"
                        >
                          <div className="product-container">
                            <div className="product-info-container">
                              <div className="product-image-container">
                                {loading ? (
                                  <Skeleton width={110} height={110} />
                                ) : (
                                  <>
                                    <div style={{ height: "35px" }}>
                                      {addedToCartImage[index] ? (
                                        <Image
                                          style={{ paddingLeft: "90px" }}
                                          width={35}
                                          height={35}
                                          src={added}
                                        />
                                      ) : (
                                        " "
                                      )}
                                    </div>
                                    <Zoom>
                                      <img
                                        alt="skksks"
                                        src={item.image}
                                        //loading="lazy"
                                        className="product-image"
                                        //aria-hidden="true"
                                      />
                                    </Zoom>
                                  </>
                                )}
                              </div>
                              <div
                                className="price-container"
                                data-testid="price-product-tile"
                              >
                                {loading ? (
                                  <Skeleton width={70} height={16} />
                                ) : (
                                  <p
                                    className={`${noir.className} price-paragraph`}
                                    data-testid="price"
                                  >
                                    ${item.prices.price}{" "}
                                    <s>({item.prices.wasPrice})</s>
                                  </p>
                                )}
                              </div>
                              {/* <a href="lalal" className="link-box-overlay"> */}
                              <div className="overlay-container">
                                {loading ? (
                                  <Skeleton width={154} height={12} />
                                ) : (
                                  <p
                                    className={`${noir.className} product-brand-paragraph`}
                                    data-testid="product-brand"
                                  >
                                    {item.brand}
                                  </p>
                                )}
                                {loading ? (
                                  <Skeleton width={154} height={12} />
                                ) : (
                                  <h3
                                    className={`${noir.className} product-title-heading`}
                                    data-testid="product-title"
                                  >
                                    {item.name}
                                  </h3>
                                )}
                                {loading ? (
                                  <Skeleton width={154} height={12} />
                                ) : (
                                  <p
                                    className="package-size-paragraph"
                                    data-testid="product-package-size"
                                  >
                                    {item.prices.size == ""
                                      ? "$" +
                                        (
                                          item.prices.unitPriceValue * 10
                                        ).toFixed(2) +
                                        " / 1" +
                                        " " +
                                        "kg"
                                      : item.prices.size}
                                  </p>
                                )}
                              </div>
                            </div>
                            {loading ? (
                              <Skeleton />
                            ) : (
                              <button
                                onClick={() => handleAddToCart(item, index)}
                                className={`${noir.className} box`}
                                style={{
                                  outline: "0",
                                  cursor: "pointer",
                                  padding: "5px 16px",
                                  fontSize: "14px",
                                  fontWeight: "500",
                                  lineHeight: "20px",
                                  verticalAlign: "middle",
                                  border: "1px solid",
                                  borderRadius: " 6px",
                                  color: " #24292e",
                                  backgroundColor: "#fafbfc",
                                  borderColor: "#1b1f2326",
                                  transition:
                                    "0.2s cubic-bezier(0.3, 0, 0.5, 1)",
                                }}
                              >
                                {addedToCart[index]
                                  ? "Added to cart"
                                  : "Add to Cart"}
                              </button>
                            )}
                          </div>
                        </li>
                      )
                  )}
              </ul>
            </>
          )}
          {bakeryAisleCount === 0 ? null : null}

          {deliAisleCount > 0 && (
            <>
              {loading ? (
                <Skeleton />
              ) : (
                <h2 id="part6" className={noir.className}>
                  Deli
                </h2>
              )}
              <ul
                className="product-list"
                style={{
                  display: "flex",
                  flexDirection: "row",
                  flexWrap: "wrap",
                }}
              >
                {responseData &&
                  responseData.map(
                    (item, index) =>
                      item.aisle === "Deli" && (
                        <li
                          key={index}
                          tabIndex="-1"
                          className="product-list-item"
                        >
                          <div className="product-container">
                            <div className="product-info-container">
                              <div className="product-image-container">
                                {loading ? (
                                  <Skeleton width={110} height={110} />
                                ) : (
                                  <>
                                    <div style={{ height: "35px" }}>
                                      {addedToCartImage[index] ? (
                                        <Image
                                          style={{ paddingLeft: "90px" }}
                                          width={35}
                                          height={35}
                                          src={added}
                                        />
                                      ) : (
                                        " "
                                      )}
                                    </div>
                                    <Zoom zoomZindex={1}>
                                      <img
                                        alt="skksks"
                                        src={item.image}
                                        //loading="lazy"
                                        className="product-image"
                                        //aria-hidden="true"
                                      />
                                    </Zoom>
                                  </>
                                )}
                              </div>
                              <div
                                className="price-container"
                                data-testid="price-product-tile"
                              >
                                {loading ? (
                                  <Skeleton width={70} height={16} />
                                ) : (
                                  <p
                                    className={`${noir.className} price-paragraph`}
                                    data-testid="price"
                                  >
                                    ${item.prices.price}
                                    {item.prices.wasPrice && (
                                      <s
                                        style={{
                                          marginRight: "10px",
                                          marginBottom: "5px",
                                        }}
                                      >
                                        ({item.prices.wasPrice})
                                      </s>
                                    )}
                                  </p>
                                )}
                              </div>
                              {/* <a href="lalal" className="link-box-overlay"> */}
                              <div className="overlay-container">
                                {loading ? (
                                  <Skeleton width={154} height={12} />
                                ) : (
                                  <p
                                    className={`${noir.className} product-brand-paragraph`}
                                    data-testid="product-brand"
                                  >
                                    {item.brand}
                                  </p>
                                )}
                                {loading ? (
                                  <Skeleton width={154} height={12} />
                                ) : (
                                  <h3
                                    className={`${noir.className} product-title-heading`}
                                    data-testid="product-title"
                                  >
                                    {item.name}
                                  </h3>
                                )}
                                {loading ? (
                                  <Skeleton width={154} height={12} />
                                ) : (
                                  <p
                                    className="package-size-paragraph"
                                    data-testid="product-package-size"
                                  >
                                    {item.prices.size == ""
                                      ? "$" +
                                        (
                                          item.prices.unitPriceValue * 10
                                        ).toFixed(2) +
                                        " / 1" +
                                        " " +
                                        "kg"
                                      : item.prices.size}
                                  </p>
                                )}
                              </div>
                            </div>
                            {loading ? (
                              <Skeleton />
                            ) : (
                              <button
                                onClick={() => handleAddToCart(item, index)}
                                className={`${noir.className} box`}
                                style={{
                                  outline: "0",
                                  cursor: "pointer",
                                  padding: "5px 16px",
                                  fontSize: "14px",
                                  fontWeight: "500",
                                  lineHeight: "20px",
                                  verticalAlign: "middle",
                                  border: "1px solid",
                                  borderRadius: " 6px",
                                  color: " #24292e",
                                  backgroundColor: "#fafbfc",
                                  borderColor: "#1b1f2326",
                                  transition:
                                    "0.2s cubic-bezier(0.3, 0, 0.5, 1)",
                                }}
                              >
                                {addedToCart[index]
                                  ? "Added to cart"
                                  : "Add to Cart"}
                              </button>
                            )}
                          </div>
                        </li>
                      )
                  )}
              </ul>
            </>
          )}
          {deliAisleCount ? null : null}

          {meatAisleCount > 0 && (
            <>
              {loading ? (
                <Skeleton />
              ) : (
                <h2 id="part7" className={noir.className}>
                  Meat
                </h2>
              )}
              <ul
                className="product-list"
                style={{
                  display: "flex",
                  flexDirection: "row",
                  flexWrap: "wrap",
                }}
              >
                {responseData &&
                  responseData.map(
                    (item, index) =>
                      item.aisle === "Meat" && (
                        <li
                          key={index}
                          tabIndex="-1"
                          className="product-list-item"
                        >
                          <div className="product-container">
                            <div className="product-info-container">
                              <div className="product-image-container">
                                {loading ? (
                                  <Skeleton width={110} height={110} />
                                ) : (
                                  <>
                                    <div style={{ height: "35px" }}>
                                      {addedToCartImage[index] ? (
                                        <Image
                                          style={{ paddingLeft: "90px" }}
                                          width={35}
                                          height={35}
                                          src={added}
                                        />
                                      ) : (
                                        " "
                                      )}
                                    </div>
                                    <Zoom zoomZindex={1}>
                                      <img
                                        alt="skksks"
                                        src={item.image}
                                        //loading="lazy"
                                        className="product-image"
                                        //aria-hidden="true"
                                      />
                                    </Zoom>
                                  </>
                                )}
                              </div>
                              <div
                                className="price-container"
                                data-testid="price-product-tile"
                              >
                                {loading ? (
                                  <Skeleton width={70} height={16} />
                                ) : (
                                  <p
                                    className={`${noir.className} price-paragraph`}
                                    data-testid="price"
                                  >
                                    ${item.prices.price}
                                    {item.prices.wasPrice && (
                                      <s
                                        style={{
                                          marginRight: "10px",
                                          marginBottom: "5px",
                                        }}
                                      >
                                        ({item.prices.wasPrice})
                                      </s>
                                    )}
                                  </p>
                                )}
                              </div>
                              {/* <a href="lalal" className="link-box-overlay"> */}
                              <div className="overlay-container">
                                {loading ? (
                                  <Skeleton width={154} height={12} />
                                ) : (
                                  <p
                                    className={`${noir.className} product-brand-paragraph`}
                                    data-testid="product-brand"
                                  >
                                    {item.brand}
                                  </p>
                                )}
                                {loading ? (
                                  <Skeleton width={154} height={12} />
                                ) : (
                                  <h3
                                    className={`${noir.className} product-title-heading`}
                                    data-testid="product-title"
                                  >
                                    {item.name}
                                  </h3>
                                )}
                                {loading ? (
                                  <Skeleton width={154} height={12} />
                                ) : (
                                  <p
                                    className="package-size-paragraph"
                                    data-testid="product-package-size"
                                  >
                                    {item.prices.size == ""
                                      ? "$" +
                                        (
                                          item.prices.unitPriceValue * 10
                                        ).toFixed(2) +
                                        " / 1" +
                                        " " +
                                        "kg"
                                      : item.prices.size}
                                  </p>
                                )}
                              </div>
                            </div>
                            {loading ? (
                              <Skeleton />
                            ) : (
                              <button
                                onClick={() => handleAddToCart(item, index)}
                                className={`${noir.className} box`}
                                style={{
                                  outline: "0",
                                  cursor: "pointer",
                                  padding: "5px 16px",
                                  fontSize: "14px",
                                  fontWeight: "500",
                                  lineHeight: "20px",
                                  verticalAlign: "middle",
                                  border: "1px solid",
                                  borderRadius: " 6px",
                                  color: " #24292e",
                                  backgroundColor: "#fafbfc",
                                  borderColor: "#1b1f2326",
                                  transition:
                                    "0.2s cubic-bezier(0.3, 0, 0.5, 1)",
                                }}
                              >
                                {addedToCart[index]
                                  ? "Added to cart"
                                  : "Add to Cart"}
                              </button>
                            )}
                          </div>
                        </li>
                      )
                  )}
              </ul>
            </>
          )}
          {meatAisleCount ? null : null}

          {fishAisleCount > 0 && (
            <>
              {loading ? (
                <Skeleton />
              ) : (
                <h2 id="part8" className={noir.className}>
                  Fish & Seafood
                </h2>
              )}
              <ul
                className="product-list"
                style={{
                  display: "flex",
                  flexDirection: "row",
                  flexWrap: "wrap",
                }}
              >
                {responseData &&
                  responseData.map(
                    (item, index) =>
                      item.aisle === "Fish & Seafood" && (
                        <li
                          key={index}
                          tabIndex="-1"
                          className="product-list-item"
                        >
                          <div className="product-container">
                            <div className="product-info-container">
                              <div className="product-image-container">
                                {loading ? (
                                  <Skeleton width={110} height={110} />
                                ) : (
                                  <>
                                    <div style={{ height: "35px" }}>
                                      {addedToCartImage[index] ? (
                                        <Image
                                          style={{ paddingLeft: "90px" }}
                                          width={35}
                                          height={35}
                                          src={added}
                                        />
                                      ) : (
                                        " "
                                      )}
                                    </div>
                                    <Zoom zoomZindex={1}>
                                      <img
                                        alt="skksks"
                                        src={item.image}
                                        //loading="lazy"
                                        className="product-image"
                                        //aria-hidden="true"
                                      />
                                    </Zoom>
                                  </>
                                )}
                              </div>
                              <div
                                className="price-container"
                                data-testid="price-product-tile"
                              >
                                {loading ? (
                                  <Skeleton width={70} height={16} />
                                ) : (
                                  <p
                                    className={`${noir.className} price-paragraph`}
                                    data-testid="price"
                                  >
                                    ${item.prices.price}
                                    {item.prices.wasPrice && (
                                      <s
                                        style={{
                                          marginRight: "10px",
                                          marginBottom: "5px",
                                        }}
                                      >
                                        ({item.prices.wasPrice})
                                      </s>
                                    )}
                                  </p>
                                )}
                              </div>
                              {/* <a href="lalal" className="link-box-overlay"> */}
                              <div className="overlay-container">
                                {loading ? (
                                  <Skeleton width={154} height={12} />
                                ) : (
                                  <p
                                    className={`${noir.className} product-brand-paragraph`}
                                    data-testid="product-brand"
                                  >
                                    {item.brand}
                                  </p>
                                )}
                                {loading ? (
                                  <Skeleton width={154} height={12} />
                                ) : (
                                  <h3
                                    className={`${noir.className} product-title-heading`}
                                    data-testid="product-title"
                                  >
                                    {item.name}
                                  </h3>
                                )}
                                {loading ? (
                                  <Skeleton width={154} height={12} />
                                ) : (
                                  <p
                                    className="package-size-paragraph"
                                    data-testid="product-package-size"
                                  >
                                    {item.prices.size == ""
                                      ? "$" +
                                        (
                                          item.prices.unitPriceValue * 10
                                        ).toFixed(2) +
                                        " / 1" +
                                        " " +
                                        "kg"
                                      : item.prices.size}
                                  </p>
                                )}
                              </div>
                            </div>
                            {loading ? (
                              <Skeleton />
                            ) : (
                              <button
                                onClick={() => handleAddToCart(item, index)}
                                className={`${noir.className} box`}
                                style={{
                                  outline: "0",
                                  cursor: "pointer",
                                  padding: "5px 16px",
                                  fontSize: "14px",
                                  fontWeight: "500",
                                  lineHeight: "20px",
                                  verticalAlign: "middle",
                                  border: "1px solid",
                                  borderRadius: " 6px",
                                  color: " #24292e",
                                  backgroundColor: "#fafbfc",
                                  borderColor: "#1b1f2326",
                                  transition:
                                    "0.2s cubic-bezier(0.3, 0, 0.5, 1)",
                                }}
                              >
                                {addedToCart[index]
                                  ? "Added to cart"
                                  : "Add to Cart"}
                              </button>
                            )}
                          </div>
                        </li>
                      )
                  )}
              </ul>
            </>
          )}
          {fishAisleCount === 0 ? null : null}

          {frozenAisleCount > 0 && (
            <>
              {loading ? (
                <Skeleton />
              ) : (
                <h2 id="part9" className={noir.className}>
                  Frozen
                </h2>
              )}
              <ul
                className="product-list"
                style={{
                  display: "flex",
                  flexDirection: "row",
                  flexWrap: "wrap",
                }}
              >
                {responseData &&
                  responseData.map(
                    (item, index) =>
                      item.aisle === "Frozen" && (
                        <li
                          key={index}
                          tabIndex="-1"
                          className="product-list-item"
                        >
                          <div className="product-container">
                            <div className="product-info-container">
                              <div className="product-image-container">
                                {loading ? (
                                  <Skeleton width={110} height={110} />
                                ) : (
                                  <>
                                    <div style={{ height: "35px" }}>
                                      {addedToCartImage[index] ? (
                                        <Image
                                          style={{ paddingLeft: "90px" }}
                                          width={35}
                                          height={35}
                                          src={added}
                                        />
                                      ) : (
                                        " "
                                      )}
                                    </div>
                                    <Zoom zoomZindex={1}>
                                      <img
                                        alt="skksks"
                                        src={item.image}
                                        //loading="lazy"
                                        className="product-image"
                                        //aria-hidden="true"
                                      />
                                    </Zoom>
                                  </>
                                )}
                              </div>
                              <div
                                className="price-container"
                                data-testid="price-product-tile"
                              >
                                {loading ? (
                                  <Skeleton width={70} height={16} />
                                ) : (
                                  <p
                                    className={`${noir.className} price-paragraph`}
                                    data-testid="price"
                                  >
                                    ${item.prices.price}
                                    {item.prices.wasPrice && (
                                      <s
                                        style={{
                                          marginRight: "10px",
                                          marginBottom: "5px",
                                        }}
                                      >
                                        ({item.prices.wasPrice})
                                      </s>
                                    )}
                                  </p>
                                )}
                              </div>
                              {/* <a href="lalal" className="link-box-overlay"> */}
                              <div className="overlay-container">
                                {loading ? (
                                  <Skeleton width={154} height={12} />
                                ) : (
                                  <p
                                    className={`${noir.className} product-brand-paragraph`}
                                    data-testid="product-brand"
                                  >
                                    {item.brand}
                                  </p>
                                )}
                                {loading ? (
                                  <Skeleton width={154} height={12} />
                                ) : (
                                  <h3
                                    className={`${noir.className} product-title-heading`}
                                    data-testid="product-title"
                                  >
                                    {item.name}
                                  </h3>
                                )}
                                {loading ? (
                                  <Skeleton width={154} height={12} />
                                ) : (
                                  <p
                                    className="package-size-paragraph"
                                    data-testid="product-package-size"
                                  >
                                    {item.prices.size == ""
                                      ? "$" +
                                        (
                                          item.prices.unitPriceValue * 10
                                        ).toFixed(2) +
                                        " / 1" +
                                        " " +
                                        "kg"
                                      : item.prices.size}
                                  </p>
                                )}
                              </div>
                            </div>
                            {loading ? (
                              <Skeleton />
                            ) : (
                              <button
                                onClick={() => handleAddToCart(item, index)}
                                className={`${noir.className} box`}
                                style={{
                                  outline: "0",
                                  cursor: "pointer",
                                  padding: "5px 16px",
                                  fontSize: "14px",
                                  fontWeight: "500",
                                  lineHeight: "20px",
                                  verticalAlign: "middle",
                                  border: "1px solid",
                                  borderRadius: " 6px",
                                  color: " #24292e",
                                  backgroundColor: "#fafbfc",
                                  borderColor: "#1b1f2326",
                                  transition:
                                    "0.2s cubic-bezier(0.3, 0, 0.5, 1)",
                                }}
                              >
                                {addedToCart[index]
                                  ? "Added to cart"
                                  : "Add to Cart"}
                              </button>
                            )}
                          </div>
                        </li>
                      )
                  )}
              </ul>
            </>
          )}
          {frozenAisleCount === 0 ? null : null}

          {houseAisleCount > 0 && (
            <>
              {loading ? (
                <Skeleton />
              ) : (
                <h2 className={noir.className}>Household Supplies</h2>
              )}
              <ul
                className="product-list"
                style={{
                  display: "flex",
                  flexDirection: "row",
                  flexWrap: "wrap",
                }}
              >
                {responseData &&
                  responseData.map(
                    (item, index) =>
                      item.aisle === "Household Supplies" && (
                        <li
                          key={index}
                          tabIndex="-1"
                          className="product-list-item"
                        >
                          <div className="product-container">
                            <div className="product-info-container">
                              <div className="product-image-container">
                                {loading ? (
                                  <Skeleton width={110} height={110} />
                                ) : (
                                  <>
                                    <div style={{ height: "35px" }}>
                                      {addedToCartImage[index] ? (
                                        <Image
                                          style={{ paddingLeft: "90px" }}
                                          width={35}
                                          height={35}
                                          src={added}
                                        />
                                      ) : (
                                        " "
                                      )}
                                    </div>
                                    <Zoom zoomZindex={1}>
                                      <img
                                        alt="skksks"
                                        src={item.image}
                                        //loading="lazy"
                                        className="product-image"
                                        //aria-hidden="true"
                                      />
                                    </Zoom>
                                  </>
                                )}
                              </div>
                              <div
                                className="price-container"
                                data-testid="price-product-tile"
                              >
                                {loading ? (
                                  <Skeleton width={70} height={16} />
                                ) : (
                                  <p
                                    className={`${noir.className} price-paragraph`}
                                    data-testid="price"
                                  >
                                    ${item.prices.price}
                                    {item.prices.wasPrice && (
                                      <s
                                        style={{
                                          marginRight: "10px",
                                          marginBottom: "5px",
                                        }}
                                      >
                                        ({item.prices.wasPrice})
                                      </s>
                                    )}
                                  </p>
                                )}
                              </div>
                              {/* <a href="lalal" className="link-box-overlay"> */}
                              <div className="overlay-container">
                                {loading ? (
                                  <Skeleton width={154} height={12} />
                                ) : (
                                  <p
                                    className={`${noir.className} product-brand-paragraph`}
                                    data-testid="product-brand"
                                  >
                                    {item.brand}
                                  </p>
                                )}
                                {loading ? (
                                  <Skeleton width={154} height={12} />
                                ) : (
                                  <h3
                                    className={`${noir.className} product-title-heading`}
                                    data-testid="product-title"
                                  >
                                    {item.name}
                                  </h3>
                                )}
                                {loading ? (
                                  <Skeleton width={154} height={12} />
                                ) : (
                                  <p
                                    className="package-size-paragraph"
                                    data-testid="product-package-size"
                                  >
                                    {item.prices.size == ""
                                      ? "$" +
                                        (
                                          item.prices.unitPriceValue * 10
                                        ).toFixed(2) +
                                        " / 1" +
                                        " " +
                                        "kg"
                                      : item.prices.size}
                                  </p>
                                )}
                              </div>
                            </div>
                            {loading ? (
                              <Skeleton />
                            ) : (
                              <button
                                onClick={() => handleAddToCart(item, index)}
                                className={`${noir.className} box`}
                                style={{
                                  outline: "0",
                                  cursor: "pointer",
                                  padding: "5px 16px",
                                  fontSize: "14px",
                                  fontWeight: "500",
                                  lineHeight: "20px",
                                  verticalAlign: "middle",
                                  border: "1px solid",
                                  borderRadius: " 6px",
                                  color: " #24292e",
                                  backgroundColor: "#fafbfc",
                                  borderColor: "#1b1f2326",
                                  transition:
                                    "0.2s cubic-bezier(0.3, 0, 0.5, 1)",
                                }}
                              >
                                {addedToCart[index]
                                  ? "Added to cart"
                                  : "Add to Cart"}
                              </button>
                            )}
                          </div>
                        </li>
                      )
                  )}
              </ul>
            </>
          )}
          {houseAisleCount === 0 ? null : null}

          {loading ? (
            <Skeleton />
          ) : (
            <h2 id="part10" className={noir.className}>
              Other products
            </h2>
          )}
          {undefinedAisleCount > 0 ? (
            <ul
              className="product-list"
              style={{
                display: "flex",
                flexDirection: "row",
                flexWrap: "wrap",
              }}
            >
              {responseData &&
                responseData.map(
                  (item, index) =>
                    item.aisle === undefined && (
                      <li
                        key={index}
                        tabIndex="-1"
                        className="product-list-item"
                      >
                        <div className="product-container">
                          <div className="product-info-container">
                            <div className="product-image-container">
                              {loading ? (
                                <Skeleton width={110} height={110} />
                              ) : (
                                <>
                                  <div style={{ height: "35px" }}>
                                    {addedToCartImage[index] ? (
                                      <Image
                                        style={{ paddingLeft: "90px" }}
                                        width={35}
                                        height={35}
                                        src={added}
                                      />
                                    ) : (
                                      " "
                                    )}
                                  </div>
                                  <Zoom>
                                    <img
                                      alt="skksks"
                                      src={item.image}
                                      //loading="lazy"
                                      className="product-image"
                                      //aria-hidden="true"
                                    />
                                  </Zoom>
                                </>
                              )}
                            </div>
                            <div
                              className="price-container"
                              data-testid="price-product-tile"
                            >
                              {loading ? (
                                <Skeleton width={70} height={16} />
                              ) : (
                                <p
                                  className={`${noir.className} price-paragraph`}
                                  data-testid="price"
                                >
                                  ${item.prices.price}
                                  {item.prices.wasPrice && (
                                    <s
                                      style={{
                                        marginRight: "10px",
                                        marginBottom: "5px",
                                      }}
                                    >
                                      ({item.prices.wasPrice})
                                    </s>
                                  )}
                                </p>
                              )}
                            </div>
                            {/* <a href="lalal" className="link-box-overlay"> */}
                            <div className="overlay-container">
                              {loading ? (
                                <Skeleton width={154} height={12} />
                              ) : (
                                <p
                                  className={`${noir.className} product-brand-paragraph`}
                                  data-testid="product-brand"
                                >
                                  {item.brand}
                                </p>
                              )}
                              {loading ? (
                                <Skeleton width={154} height={12} />
                              ) : (
                                <h3
                                  className={`${noir.className} product-title-heading`}
                                  data-testid="product-title"
                                >
                                  {item.name}
                                </h3>
                              )}
                              {loading ? (
                                <Skeleton width={154} height={12} />
                              ) : (
                                <p
                                  className="package-size-paragraph"
                                  data-testid="product-package-size"
                                >
                                  {item.prices.size == ""
                                    ? "$" +
                                      (item.prices.unitPriceValue * 10).toFixed(
                                        2
                                      ) +
                                      " / 1" +
                                      " " +
                                      "kg"
                                    : item.prices.size}
                                </p>
                              )}
                            </div>
                          </div>
                          {loading ? (
                            <Skeleton />
                          ) : (
                            <button
                              onClick={() => handleAddToCart(item, index)}
                              className={`${noir.className} box`}
                              style={{
                                outline: "0",
                                cursor: "pointer",
                                padding: "5px 16px",
                                fontSize: "14px",
                                fontWeight: "500",
                                lineHeight: "20px",
                                verticalAlign: "middle",
                                border: "1px solid",
                                borderRadius: " 6px",
                                color: " #24292e",
                                backgroundColor: "#fafbfc",
                                borderColor: "#1b1f2326",
                                transition: "0.2s cubic-bezier(0.3, 0, 0.5, 1)",
                              }}
                            >
                              {addedToCart[index]
                                ? "Added to cart"
                                : "Add to Cart"}
                            </button>
                          )}
                        </div>
                      </li>
                    )
                )}
            </ul>
          ) : (
            "Nothing today"
          )}
        </div>
      ) : firstTime && loading ? (
        <Loading />
      ) : firstTime ? (
        <About />
      ) : (
        <div style={{ overflowX: "auto", minWidth: "100%", marginTop: "32px" }}>
          {fruitsAisleCount > 0 && (
            <>
              {loading ? (
                <Skeleton />
              ) : (
                <h2 className={noir.className}>Other products</h2>
              )}
              <ul
                className="product-list"
                style={{
                  display: "flex",
                  flexDirection: "row",
                  flexWrap: "wrap",
                }}
              >
                {responseData &&
                  responseData.map(
                    (item, index) =>
                      item.aisle === "Fruits & Vegetables" && (
                        <li
                          key={index}
                          tabIndex="-1"
                          className="product-list-item"
                        >
                          <div className="product-container">
                            <div className="product-info-container">
                              <div className="product-image-container">
                                {loading ? (
                                  <Skeleton width={110} height={110} />
                                ) : (
                                  <>
                                    <div style={{ height: "35px" }}>
                                      {addedToCartImage[index] ? (
                                        <Image
                                          style={{ paddingLeft: "90px" }}
                                          width={35}
                                          height={35}
                                          src={added}
                                        />
                                      ) : (
                                        " "
                                      )}
                                    </div>
                                    <Zoom>
                                      <img
                                        alt="skksks"
                                        src={item.image}
                                        //loading="lazy"
                                        className="product-image"
                                        //aria-hidden="true"
                                      />
                                    </Zoom>
                                  </>
                                )}
                              </div>
                              <div
                                className="price-container"
                                data-testid="price-product-tile"
                              >
                                {loading ? (
                                  <Skeleton width={70} height={16} />
                                ) : (
                                  <p
                                    className={`${noir.className} price-paragraph`}
                                    data-testid="price"
                                  >
                                    ${item.prices.price}
                                    {item.prices.wasPrice && (
                                      <s
                                        style={{
                                          marginRight: "10px",
                                          marginBottom: "5px",
                                        }}
                                      >
                                        ({item.prices.wasPrice})
                                      </s>
                                    )}
                                  </p>
                                )}
                              </div>
                              {/* <a href="lalal" className="link-box-overlay"> */}
                              <div className="overlay-container">
                                {loading ? (
                                  <Skeleton width={154} height={12} />
                                ) : (
                                  <p
                                    className={`${noir.className} product-brand-paragraph`}
                                    data-testid="product-brand"
                                  >
                                    {item.brand}
                                  </p>
                                )}
                                {loading ? (
                                  <Skeleton width={154} height={12} />
                                ) : (
                                  <h3
                                    className={`${noir.className} product-title-heading`}
                                    data-testid="product-title"
                                  >
                                    {item.name}
                                  </h3>
                                )}
                                {loading ? (
                                  <Skeleton width={154} height={12} />
                                ) : (
                                  <p
                                    className="package-size-paragraph"
                                    data-testid="product-package-size"
                                  >
                                    {item.prices.size == ""
                                      ? "$" +
                                        (
                                          item.prices.unitPriceValue * 10
                                        ).toFixed(2) +
                                        " / 1" +
                                        " " +
                                        "kg"
                                      : item.prices.size}
                                  </p>
                                )}
                              </div>
                            </div>
                            {loading ? (
                              <Skeleton />
                            ) : (
                              <button
                                onClick={() => handleAddToCart(item, index)}
                                className={`${noir.className} box`}
                                style={{
                                  outline: "0",
                                  cursor: "pointer",
                                  padding: "5px 16px",
                                  fontSize: "14px",
                                  fontWeight: "500",
                                  lineHeight: "20px",
                                  verticalAlign: "middle",
                                  border: "1px solid",
                                  borderRadius: " 6px",
                                  color: " #24292e",
                                  backgroundColor: "#fafbfc",
                                  borderColor: "#1b1f2326",
                                  transition:
                                    "0.2s cubic-bezier(0.3, 0, 0.5, 1)",
                                }}
                              >
                                {addedToCart[index]
                                  ? "Added to cart"
                                  : "Add to Cart"}
                              </button>
                            )}
                          </div>
                        </li>
                      )
                  )}
              </ul>
            </>
          )}
          {fruitsAisleCount === 0 ? null : null}
          {snacksAisleCount > 0 && (
            <>
              {loading ? (
                <Skeleton />
              ) : (
                <h2 className={noir.className}>Snacks, Chips & Candy</h2>
              )}
              <ul
                className="product-list"
                style={{
                  display: "flex",
                  flexDirection: "row",
                  flexWrap: "wrap",
                }}
              >
                {responseData &&
                  responseData.map(
                    (item, index) =>
                      item.aisle === "Snacks, Chips & Candy" && (
                        <li
                          key={index}
                          tabIndex="-1"
                          className="product-list-item"
                        >
                          <div className="product-container">
                            <div className="product-info-container">
                              <div className="product-image-container">
                                {loading ? (
                                  <Skeleton width={110} height={110} />
                                ) : (
                                  <>
                                    <div style={{ height: "35px" }}>
                                      {addedToCartImage[index] ? (
                                        <Image
                                          style={{ paddingLeft: "90px" }}
                                          width={35}
                                          height={35}
                                          src={added}
                                        />
                                      ) : (
                                        " "
                                      )}
                                    </div>
                                    <Zoom>
                                      <img
                                        alt="skksks"
                                        src={item.image}
                                        //loading="lazy"
                                        className="product-image"
                                        //aria-hidden="true"
                                      />
                                    </Zoom>
                                  </>
                                )}
                              </div>
                              <div
                                className="price-container"
                                data-testid="price-product-tile"
                              >
                                {loading ? (
                                  <Skeleton width={70} height={16} />
                                ) : (
                                  <p
                                    className={`${noir.className} price-paragraph`}
                                    data-testid="price"
                                  >
                                    ${item.prices.price}
                                    {item.prices.wasPrice && (
                                      <s
                                        style={{
                                          marginRight: "10px",
                                          marginBottom: "5px",
                                        }}
                                      >
                                        ({item.prices.wasPrice})
                                      </s>
                                    )}
                                  </p>
                                )}
                              </div>
                              {/* <a href="lalal" className="link-box-overlay"> */}
                              <div className="overlay-container">
                                {loading ? (
                                  <Skeleton width={154} height={12} />
                                ) : (
                                  <p
                                    className={`${noir.className} product-brand-paragraph`}
                                    data-testid="product-brand"
                                  >
                                    {item.brand}
                                  </p>
                                )}
                                {loading ? (
                                  <Skeleton width={154} height={12} />
                                ) : (
                                  <h3
                                    className={`${noir.className} product-title-heading`}
                                    data-testid="product-title"
                                  >
                                    {item.name}
                                  </h3>
                                )}
                                {loading ? (
                                  <Skeleton width={154} height={12} />
                                ) : (
                                  <p
                                    className="package-size-paragraph"
                                    data-testid="product-package-size"
                                  >
                                    {item.prices.size == ""
                                      ? "$" +
                                        (
                                          item.prices.unitPriceValue * 10
                                        ).toFixed(2) +
                                        " / 1" +
                                        " " +
                                        "kg"
                                      : item.prices.size}
                                  </p>
                                )}
                              </div>
                            </div>
                            {loading ? (
                              <Skeleton />
                            ) : (
                              <button
                                onClick={() => handleAddToCart(item, index)}
                                className={`${noir.className} box`}
                                style={{
                                  outline: "0",
                                  cursor: "pointer",
                                  padding: "5px 16px",
                                  fontSize: "14px",
                                  fontWeight: "500",
                                  lineHeight: "20px",
                                  verticalAlign: "middle",
                                  border: "1px solid",
                                  borderRadius: " 6px",
                                  color: " #24292e",
                                  backgroundColor: "#fafbfc",
                                  borderColor: "#1b1f2326",
                                  transition:
                                    "0.2s cubic-bezier(0.3, 0, 0.5, 1)",
                                }}
                              >
                                {addedToCart[index]
                                  ? "Added to cart"
                                  : "Add to Cart"}
                              </button>
                            )}
                          </div>
                        </li>
                      )
                  )}
              </ul>
            </>
          )}
          {snacksAisleCount === 0 ? null : null}
          {dairyAisleCount > 0 && (
            <>
              {loading ? (
                <Skeleton />
              ) : (
                <h2 className={noir.className}>Dairy & Eggs</h2>
              )}
              <ul
                className="product-list"
                style={{
                  display: "flex",
                  flexDirection: "row",
                  flexWrap: "wrap",
                }}
              >
                {responseData &&
                  responseData.map(
                    (item, index) =>
                      item.aisle === "Dairy & Eggs" && (
                        <li
                          key={index}
                          tabIndex="-1"
                          className="product-list-item"
                        >
                          <div className="product-container">
                            <div className="product-info-container">
                              <div className="product-image-container">
                                {loading ? (
                                  <Skeleton width={110} height={110} />
                                ) : (
                                  <>
                                    <div style={{ height: "35px" }}>
                                      {addedToCartImage[index] ? (
                                        <Image
                                          style={{ paddingLeft: "90px" }}
                                          width={35}
                                          height={35}
                                          src={added}
                                        />
                                      ) : (
                                        " "
                                      )}
                                    </div>
                                    <Zoom>
                                      <img
                                        alt="skksks"
                                        src={item.image}
                                        //loading="lazy"
                                        className="product-image"
                                        //aria-hidden="true"
                                      />
                                    </Zoom>
                                  </>
                                )}
                              </div>
                              <div
                                className="price-container"
                                data-testid="price-product-tile"
                              >
                                {loading ? (
                                  <Skeleton width={70} height={16} />
                                ) : (
                                  <p
                                    className={`${noir.className} price-paragraph`}
                                    data-testid="price"
                                  >
                                    ${item.prices.price}
                                    {item.prices.wasPrice && (
                                      <s
                                        style={{
                                          marginRight: "10px",
                                          marginBottom: "5px",
                                        }}
                                      >
                                        ({item.prices.wasPrice})
                                      </s>
                                    )}
                                  </p>
                                )}
                              </div>
                              {/* <a href="lalal" className="link-box-overlay"> */}
                              <div className="overlay-container">
                                {loading ? (
                                  <Skeleton width={154} height={12} />
                                ) : (
                                  <p
                                    className={`${noir.className} product-brand-paragraph`}
                                    data-testid="product-brand"
                                  >
                                    {item.brand}
                                  </p>
                                )}
                                {loading ? (
                                  <Skeleton width={154} height={12} />
                                ) : (
                                  <h3
                                    className={`${noir.className} product-title-heading`}
                                    data-testid="product-title"
                                  >
                                    {item.name}
                                  </h3>
                                )}
                                {loading ? (
                                  <Skeleton width={154} height={12} />
                                ) : (
                                  <p
                                    className="package-size-paragraph"
                                    data-testid="product-package-size"
                                  >
                                    {item.prices.size == ""
                                      ? "$" +
                                        (
                                          item.prices.unitPriceValue * 10
                                        ).toFixed(2) +
                                        " / 1" +
                                        " " +
                                        "kg"
                                      : item.prices.size}
                                  </p>
                                )}
                              </div>
                            </div>
                            {loading ? (
                              <Skeleton />
                            ) : (
                              <button
                                onClick={() => handleAddToCart(item, index)}
                                className={`${noir.className} box`}
                                style={{
                                  outline: "0",
                                  cursor: "pointer",
                                  padding: "5px 16px",
                                  fontSize: "14px",
                                  fontWeight: "500",
                                  lineHeight: "20px",
                                  verticalAlign: "middle",
                                  border: "1px solid",
                                  borderRadius: " 6px",
                                  color: " #24292e",
                                  backgroundColor: "#fafbfc",
                                  borderColor: "#1b1f2326",
                                  transition:
                                    "0.2s cubic-bezier(0.3, 0, 0.5, 1)",
                                }}
                              >
                                {addedToCart[index]
                                  ? "Added to cart"
                                  : "Add to Cart"}
                              </button>
                            )}
                          </div>
                        </li>
                      )
                  )}
              </ul>
            </>
          )}
          {dairyAisleCount === 0 ? null : null}
          {drinksAisleCount > 0 && (
            <>
              {loading ? (
                <Skeleton />
              ) : (
                <h2 className={noir.className}>Drinks</h2>
              )}
              <ul
                className="product-list"
                style={{
                  display: "flex",
                  flexDirection: "row",
                  flexWrap: "wrap",
                }}
              >
                {responseData &&
                  responseData.map(
                    (item, index) =>
                      item.aisle === "Drinks" && (
                        <li
                          key={index}
                          tabIndex="-1"
                          className="product-list-item"
                        >
                          <div className="product-container">
                            <div className="product-info-container">
                              <div className="product-image-container">
                                {loading ? (
                                  <Skeleton width={110} height={110} />
                                ) : (
                                  <>
                                    <div style={{ height: "35px" }}>
                                      {addedToCartImage[index] ? (
                                        <Image
                                          style={{ paddingLeft: "90px" }}
                                          width={35}
                                          height={35}
                                          src={added}
                                        />
                                      ) : (
                                        " "
                                      )}
                                    </div>
                                    <Zoom>
                                      <img
                                        alt="skksks"
                                        src={item.image}
                                        //loading="lazy"
                                        className="product-image"
                                        //aria-hidden="true"
                                      />
                                    </Zoom>
                                  </>
                                )}
                              </div>
                              <div
                                className="price-container"
                                data-testid="price-product-tile"
                              >
                                {loading ? (
                                  <Skeleton width={70} height={16} />
                                ) : (
                                  <p
                                    className={`${noir.className} price-paragraph`}
                                    data-testid="price"
                                  >
                                    ${item.prices.price}
                                    {item.prices.wasPrice && (
                                      <s
                                        style={{
                                          marginRight: "10px",
                                          marginBottom: "5px",
                                        }}
                                      >
                                        ({item.prices.wasPrice})
                                      </s>
                                    )}
                                  </p>
                                )}
                              </div>
                              {/* <a href="lalal" className="link-box-overlay"> */}
                              <div className="overlay-container">
                                {loading ? (
                                  <Skeleton width={154} height={12} />
                                ) : (
                                  <p
                                    className={`${noir.className} product-brand-paragraph`}
                                    data-testid="product-brand"
                                  >
                                    {item.brand}
                                  </p>
                                )}
                                {loading ? (
                                  <Skeleton width={154} height={12} />
                                ) : (
                                  <h3
                                    className={`${noir.className} product-title-heading`}
                                    data-testid="product-title"
                                  >
                                    {item.name}
                                  </h3>
                                )}
                                {loading ? (
                                  <Skeleton width={154} height={12} />
                                ) : (
                                  <p
                                    className="package-size-paragraph"
                                    data-testid="product-package-size"
                                  >
                                    {item.prices.size == ""
                                      ? "$" +
                                        (
                                          item.prices.unitPriceValue * 10
                                        ).toFixed(2) +
                                        " / 1" +
                                        " " +
                                        "kg"
                                      : item.prices.size}
                                  </p>
                                )}
                              </div>
                            </div>
                            {loading ? (
                              <Skeleton />
                            ) : (
                              <button
                                onClick={() => handleAddToCart(item, index)}
                                className={`${noir.className} box`}
                                style={{
                                  outline: "0",
                                  cursor: "pointer",
                                  padding: "5px 16px",
                                  fontSize: "14px",
                                  fontWeight: "500",
                                  lineHeight: "20px",
                                  verticalAlign: "middle",
                                  border: "1px solid",
                                  borderRadius: " 6px",
                                  color: " #24292e",
                                  backgroundColor: "#fafbfc",
                                  borderColor: "#1b1f2326",
                                  transition:
                                    "0.2s cubic-bezier(0.3, 0, 0.5, 1)",
                                }}
                              >
                                {addedToCart[index]
                                  ? "Added to cart"
                                  : "Add to Cart"}
                              </button>
                            )}
                          </div>
                        </li>
                      )
                  )}
              </ul>
            </>
          )}
          {drinksAisleCount === 0 ? null : null}
          {bakeryAisleCount > 0 && (
            <>
              {loading ? (
                <Skeleton />
              ) : (
                <h2 className={noir.className}>Bakery</h2>
              )}
              <ul
                className="product-list"
                style={{
                  display: "flex",
                  flexDirection: "row",
                  flexWrap: "wrap",
                }}
              >
                {responseData &&
                  responseData.map(
                    (item, index) =>
                      item.aisle === "Bakery" && (
                        <li
                          key={index}
                          tabIndex="-1"
                          className="product-list-item"
                        >
                          <div className="product-container">
                            <div className="product-info-container">
                              <div className="product-image-container">
                                {loading ? (
                                  <Skeleton width={110} height={110} />
                                ) : (
                                  <>
                                    <div style={{ height: "35px" }}>
                                      {addedToCartImage[index] ? (
                                        <Image
                                          style={{ paddingLeft: "90px" }}
                                          width={35}
                                          height={35}
                                          src={added}
                                        />
                                      ) : (
                                        " "
                                      )}
                                    </div>
                                    <Zoom>
                                      <img
                                        alt="skksks"
                                        src={item.image}
                                        //loading="lazy"
                                        className="product-image"
                                        //aria-hidden="true"
                                      />
                                    </Zoom>
                                  </>
                                )}
                              </div>
                              <div
                                className="price-container"
                                data-testid="price-product-tile"
                              >
                                {loading ? (
                                  <Skeleton width={70} height={16} />
                                ) : (
                                  <p
                                    className={`${noir.className} price-paragraph`}
                                    data-testid="price"
                                  >
                                    ${item.prices.price}{" "}
                                    <s>({item.prices.wasPrice})</s>
                                  </p>
                                )}
                              </div>
                              {/* <a href="lalal" className="link-box-overlay"> */}
                              <div className="overlay-container">
                                {loading ? (
                                  <Skeleton width={154} height={12} />
                                ) : (
                                  <p
                                    className={`${noir.className} product-brand-paragraph`}
                                    data-testid="product-brand"
                                  >
                                    {item.brand}
                                  </p>
                                )}
                                {loading ? (
                                  <Skeleton width={154} height={12} />
                                ) : (
                                  <h3
                                    className={`${noir.className} product-title-heading`}
                                    data-testid="product-title"
                                  >
                                    {item.name}
                                  </h3>
                                )}
                                {loading ? (
                                  <Skeleton width={154} height={12} />
                                ) : (
                                  <p
                                    className="package-size-paragraph"
                                    data-testid="product-package-size"
                                  >
                                    {item.prices.size == ""
                                      ? "$" +
                                        (
                                          item.prices.unitPriceValue * 10
                                        ).toFixed(2) +
                                        " / 1" +
                                        " " +
                                        "kg"
                                      : item.prices.size}
                                  </p>
                                )}
                              </div>
                            </div>
                            {loading ? (
                              <Skeleton />
                            ) : (
                              <button
                                onClick={() => handleAddToCart(item, index)}
                                className={`${noir.className} box`}
                                style={{
                                  outline: "0",
                                  cursor: "pointer",
                                  padding: "5px 16px",
                                  fontSize: "14px",
                                  fontWeight: "500",
                                  lineHeight: "20px",
                                  verticalAlign: "middle",
                                  border: "1px solid",
                                  borderRadius: " 6px",
                                  color: " #24292e",
                                  backgroundColor: "#fafbfc",
                                  borderColor: "#1b1f2326",
                                  transition:
                                    "0.2s cubic-bezier(0.3, 0, 0.5, 1)",
                                }}
                              >
                                {addedToCart[index]
                                  ? "Added to cart"
                                  : "Add to Cart"}
                              </button>
                            )}
                          </div>
                        </li>
                      )
                  )}
              </ul>
            </>
          )}
          {bakeryAisleCount === 0 ? null : null}

          {deliAisleCount > 0 && (
            <>
              {loading ? (
                <Skeleton />
              ) : (
                <h2 className={noir.className}>Deli</h2>
              )}
              <ul
                className="product-list"
                style={{
                  display: "flex",
                  flexDirection: "row",
                  flexWrap: "wrap",
                }}
              >
                {responseData &&
                  responseData.map(
                    (item, index) =>
                      item.aisle === "Deli" && (
                        <li
                          key={index}
                          tabIndex="-1"
                          className="product-list-item"
                        >
                          <div className="product-container">
                            <div className="product-info-container">
                              <div className="product-image-container">
                                {loading ? (
                                  <Skeleton width={110} height={110} />
                                ) : (
                                  <>
                                    <div style={{ height: "35px" }}>
                                      {addedToCartImage[index] ? (
                                        <Image
                                          style={{ paddingLeft: "90px" }}
                                          width={35}
                                          height={35}
                                          src={added}
                                        />
                                      ) : (
                                        " "
                                      )}
                                    </div>
                                    <Zoom>
                                      <img
                                        alt="skksks"
                                        src={item.image}
                                        //loading="lazy"
                                        className="product-image"
                                        //aria-hidden="true"
                                      />
                                    </Zoom>
                                  </>
                                )}
                              </div>
                              <div
                                className="price-container"
                                data-testid="price-product-tile"
                              >
                                {loading ? (
                                  <Skeleton width={70} height={16} />
                                ) : (
                                  <p
                                    className={`${noir.className} price-paragraph`}
                                    data-testid="price"
                                  >
                                    ${item.prices.price}
                                    {item.prices.wasPrice && (
                                      <s
                                        style={{
                                          marginRight: "10px",
                                          marginBottom: "5px",
                                        }}
                                      >
                                        ({item.prices.wasPrice})
                                      </s>
                                    )}
                                  </p>
                                )}
                              </div>
                              {/* <a href="lalal" className="link-box-overlay"> */}
                              <div className="overlay-container">
                                {loading ? (
                                  <Skeleton width={154} height={12} />
                                ) : (
                                  <p
                                    className={`${noir.className} product-brand-paragraph`}
                                    data-testid="product-brand"
                                  >
                                    {item.brand}
                                  </p>
                                )}
                                {loading ? (
                                  <Skeleton width={154} height={12} />
                                ) : (
                                  <h3
                                    className={`${noir.className} product-title-heading`}
                                    data-testid="product-title"
                                  >
                                    {item.name}
                                  </h3>
                                )}
                                {loading ? (
                                  <Skeleton width={154} height={12} />
                                ) : (
                                  <p
                                    className="package-size-paragraph"
                                    data-testid="product-package-size"
                                  >
                                    {item.prices.size == ""
                                      ? "$" +
                                        (
                                          item.prices.unitPriceValue * 10
                                        ).toFixed(2) +
                                        " / 1" +
                                        " " +
                                        "kg"
                                      : item.prices.size}
                                  </p>
                                )}
                              </div>
                            </div>
                            {loading ? (
                              <Skeleton />
                            ) : (
                              <button
                                onClick={() => handleAddToCart(item, index)}
                                className={`${noir.className} box`}
                                style={{
                                  outline: "0",
                                  cursor: "pointer",
                                  padding: "5px 16px",
                                  fontSize: "14px",
                                  fontWeight: "500",
                                  lineHeight: "20px",
                                  verticalAlign: "middle",
                                  border: "1px solid",
                                  borderRadius: " 6px",
                                  color: " #24292e",
                                  backgroundColor: "#fafbfc",
                                  borderColor: "#1b1f2326",
                                  transition:
                                    "0.2s cubic-bezier(0.3, 0, 0.5, 1)",
                                }}
                              >
                                {addedToCart[index]
                                  ? "Added to cart"
                                  : "Add to Cart"}
                              </button>
                            )}
                          </div>
                        </li>
                      )
                  )}
              </ul>
            </>
          )}
          {deliAisleCount === 0 ? null : null}

          {meatAisleCount > 0 && (
            <>
              {loading ? (
                <Skeleton />
              ) : (
                <h2 className={noir.className}>Meat</h2>
              )}
              <ul
                className="product-list"
                style={{
                  display: "flex",
                  flexDirection: "row",
                  flexWrap: "wrap",
                }}
              >
                {responseData &&
                  responseData.map(
                    (item, index) =>
                      item.aisle === "Meat" && (
                        <li
                          key={index}
                          tabIndex="-1"
                          className="product-list-item"
                        >
                          <div className="product-container">
                            <div className="product-info-container">
                              <div className="product-image-container">
                                {loading ? (
                                  <Skeleton width={110} height={110} />
                                ) : (
                                  <>
                                    <div style={{ height: "35px" }}>
                                      {addedToCartImage[index] ? (
                                        <Image
                                          style={{ paddingLeft: "90px" }}
                                          width={35}
                                          height={35}
                                          src={added}
                                        />
                                      ) : (
                                        " "
                                      )}
                                    </div>
                                    <Zoom>
                                      <img
                                        alt="skksks"
                                        src={item.image}
                                        //loading="lazy"
                                        className="product-image"
                                        //aria-hidden="true"
                                      />
                                    </Zoom>
                                  </>
                                )}
                              </div>
                              <div
                                className="price-container"
                                data-testid="price-product-tile"
                              >
                                {loading ? (
                                  <Skeleton width={70} height={16} />
                                ) : (
                                  <p
                                    className={`${noir.className} price-paragraph`}
                                    data-testid="price"
                                  >
                                    ${item.prices.price}
                                    {item.prices.wasPrice && (
                                      <s
                                        style={{
                                          marginRight: "10px",
                                          marginBottom: "5px",
                                        }}
                                      >
                                        ({item.prices.wasPrice})
                                      </s>
                                    )}
                                  </p>
                                )}
                              </div>
                              {/* <a href="lalal" className="link-box-overlay"> */}
                              <div className="overlay-container">
                                {loading ? (
                                  <Skeleton width={154} height={12} />
                                ) : (
                                  <p
                                    className={`${noir.className} product-brand-paragraph`}
                                    data-testid="product-brand"
                                  >
                                    {item.brand}
                                  </p>
                                )}
                                {loading ? (
                                  <Skeleton width={154} height={12} />
                                ) : (
                                  <h3
                                    className={`${noir.className} product-title-heading`}
                                    data-testid="product-title"
                                  >
                                    {item.name}
                                  </h3>
                                )}
                                {loading ? (
                                  <Skeleton width={154} height={12} />
                                ) : (
                                  <p
                                    className="package-size-paragraph"
                                    data-testid="product-package-size"
                                  >
                                    {item.prices.size == ""
                                      ? "$" +
                                        (
                                          item.prices.unitPriceValue * 10
                                        ).toFixed(2) +
                                        " / 1" +
                                        " " +
                                        "kg"
                                      : item.prices.size}
                                  </p>
                                )}
                              </div>
                            </div>
                            {loading ? (
                              <Skeleton />
                            ) : (
                              <button
                                onClick={() => handleAddToCart(item, index)}
                                className={`${noir.className} box`}
                                style={{
                                  outline: "0",
                                  cursor: "pointer",
                                  padding: "5px 16px",
                                  fontSize: "14px",
                                  fontWeight: "500",
                                  lineHeight: "20px",
                                  verticalAlign: "middle",
                                  border: "1px solid",
                                  borderRadius: " 6px",
                                  color: " #24292e",
                                  backgroundColor: "#fafbfc",
                                  borderColor: "#1b1f2326",
                                  transition:
                                    "0.2s cubic-bezier(0.3, 0, 0.5, 1)",
                                }}
                              >
                                {addedToCart[index]
                                  ? "Added to cart"
                                  : "Add to Cart"}
                              </button>
                            )}
                          </div>
                        </li>
                      )
                  )}
              </ul>
            </>
          )}
          {meatAisleCount === 0 ? null : null}

          {fishAisleCount > 0 && (
            <>
              {" "}
              {loading ? (
                <Skeleton />
              ) : (
                <h2 className={noir.className}>Fish & Seafood</h2>
              )}
              <ul
                className="product-list"
                style={{
                  display: "flex",
                  flexDirection: "row",
                  flexWrap: "wrap",
                }}
              >
                {responseData &&
                  responseData.map(
                    (item, index) =>
                      item.aisle === "Fish & Seafood" && (
                        <li
                          key={index}
                          tabIndex="-1"
                          className="product-list-item"
                        >
                          <div className="product-container">
                            <div className="product-info-container">
                              <div className="product-image-container">
                                {loading ? (
                                  <Skeleton width={110} height={110} />
                                ) : (
                                  <>
                                    <div style={{ height: "35px" }}>
                                      {addedToCartImage[index] ? (
                                        <Image
                                          style={{ paddingLeft: "90px" }}
                                          width={35}
                                          height={35}
                                          src={added}
                                        />
                                      ) : (
                                        " "
                                      )}
                                    </div>
                                    <Zoom>
                                      <img
                                        alt="skksks"
                                        src={item.image}
                                        //loading="lazy"
                                        className="product-image"
                                        //aria-hidden="true"
                                      />
                                    </Zoom>
                                  </>
                                )}
                              </div>
                              <div
                                className="price-container"
                                data-testid="price-product-tile"
                              >
                                {loading ? (
                                  <Skeleton width={70} height={16} />
                                ) : (
                                  <p
                                    className={`${noir.className} price-paragraph`}
                                    data-testid="price"
                                  >
                                    ${item.prices.price}
                                    {item.prices.wasPrice && (
                                      <s
                                        style={{
                                          marginRight: "10px",
                                          marginBottom: "5px",
                                        }}
                                      >
                                        ({item.prices.wasPrice})
                                      </s>
                                    )}
                                  </p>
                                )}
                              </div>
                              {/* <a href="lalal" className="link-box-overlay"> */}
                              <div className="overlay-container">
                                {loading ? (
                                  <Skeleton width={154} height={12} />
                                ) : (
                                  <p
                                    className={`${noir.className} product-brand-paragraph`}
                                    data-testid="product-brand"
                                  >
                                    {item.brand}
                                  </p>
                                )}
                                {loading ? (
                                  <Skeleton width={154} height={12} />
                                ) : (
                                  <h3
                                    className={`${noir.className} product-title-heading`}
                                    data-testid="product-title"
                                  >
                                    {item.name}
                                  </h3>
                                )}
                                {loading ? (
                                  <Skeleton width={154} height={12} />
                                ) : (
                                  <p
                                    className="package-size-paragraph"
                                    data-testid="product-package-size"
                                  >
                                    {item.prices.size == ""
                                      ? "$" +
                                        (
                                          item.prices.unitPriceValue * 10
                                        ).toFixed(2) +
                                        " / 1" +
                                        " " +
                                        "kg"
                                      : item.prices.size}
                                  </p>
                                )}
                              </div>
                            </div>
                            {loading ? (
                              <Skeleton />
                            ) : (
                              <button
                                onClick={() => handleAddToCart(item, index)}
                                className={`${noir.className} box`}
                                style={{
                                  outline: "0",
                                  cursor: "pointer",
                                  padding: "5px 16px",
                                  fontSize: "14px",
                                  fontWeight: "500",
                                  lineHeight: "20px",
                                  verticalAlign: "middle",
                                  border: "1px solid",
                                  borderRadius: " 6px",
                                  color: " #24292e",
                                  backgroundColor: "#fafbfc",
                                  borderColor: "#1b1f2326",
                                  transition:
                                    "0.2s cubic-bezier(0.3, 0, 0.5, 1)",
                                }}
                              >
                                {addedToCart[index]
                                  ? "Added to cart"
                                  : "Add to Cart"}
                              </button>
                            )}
                          </div>
                        </li>
                      )
                  )}
              </ul>
            </>
          )}
          {fishAisleCount ? null : null}

          {frozenAisleCount > 0 && (
            <>
              {" "}
              {loading ? (
                <Skeleton />
              ) : (
                <h2 className={noir.className}>Frozen</h2>
              )}
              <ul
                className="product-list"
                style={{
                  display: "flex",
                  flexDirection: "row",
                  flexWrap: "wrap",
                }}
              >
                {responseData &&
                  responseData.map(
                    (item, index) =>
                      item.aisle === "Frozen" && (
                        <li
                          key={index}
                          tabIndex="-1"
                          className="product-list-item"
                        >
                          <div className="product-container">
                            <div className="product-info-container">
                              <div className="product-image-container">
                                {loading ? (
                                  <Skeleton width={110} height={110} />
                                ) : (
                                  <>
                                    <div style={{ height: "35px" }}>
                                      {addedToCartImage[index] ? (
                                        <Image
                                          style={{ paddingLeft: "90px" }}
                                          width={35}
                                          height={35}
                                          src={added}
                                        />
                                      ) : (
                                        " "
                                      )}
                                    </div>
                                    <Zoom>
                                      <img
                                        alt="skksks"
                                        src={item.image}
                                        //loading="lazy"
                                        className="product-image"
                                        //aria-hidden="true"
                                      />
                                    </Zoom>
                                  </>
                                )}
                              </div>
                              <div
                                className="price-container"
                                data-testid="price-product-tile"
                              >
                                {loading ? (
                                  <Skeleton width={70} height={16} />
                                ) : (
                                  <p
                                    className={`${noir.className} price-paragraph`}
                                    data-testid="price"
                                  >
                                    ${item.prices.price}
                                    {item.prices.wasPrice && (
                                      <s
                                        style={{
                                          marginRight: "10px",
                                          marginBottom: "5px",
                                        }}
                                      >
                                        ({item.prices.wasPrice})
                                      </s>
                                    )}
                                  </p>
                                )}
                              </div>
                              {/* <a href="lalal" className="link-box-overlay"> */}
                              <div className="overlay-container">
                                {loading ? (
                                  <Skeleton width={154} height={12} />
                                ) : (
                                  <p
                                    className={`${noir.className} product-brand-paragraph`}
                                    data-testid="product-brand"
                                  >
                                    {item.brand}
                                  </p>
                                )}
                                {loading ? (
                                  <Skeleton width={154} height={12} />
                                ) : (
                                  <h3
                                    className={`${noir.className} product-title-heading`}
                                    data-testid="product-title"
                                  >
                                    {item.name}
                                  </h3>
                                )}
                                {loading ? (
                                  <Skeleton width={154} height={12} />
                                ) : (
                                  <p
                                    className="package-size-paragraph"
                                    data-testid="product-package-size"
                                  >
                                    {item.prices.size == ""
                                      ? "$" +
                                        (
                                          item.prices.unitPriceValue * 10
                                        ).toFixed(2) +
                                        " / 1" +
                                        " " +
                                        "kg"
                                      : item.prices.size}
                                  </p>
                                )}
                              </div>
                            </div>
                            {loading ? (
                              <Skeleton />
                            ) : (
                              <button
                                onClick={() => handleAddToCart(item, index)}
                                className={`${noir.className} box`}
                                style={{
                                  outline: "0",
                                  cursor: "pointer",
                                  padding: "5px 16px",
                                  fontSize: "14px",
                                  fontWeight: "500",
                                  lineHeight: "20px",
                                  verticalAlign: "middle",
                                  border: "1px solid",
                                  borderRadius: " 6px",
                                  color: " #24292e",
                                  backgroundColor: "#fafbfc",
                                  borderColor: "#1b1f2326",
                                  transition:
                                    "0.2s cubic-bezier(0.3, 0, 0.5, 1)",
                                }}
                              >
                                {addedToCart[index]
                                  ? "Added to cart"
                                  : "Add to Cart"}
                              </button>
                            )}
                          </div>
                        </li>
                      )
                  )}
              </ul>
            </>
          )}
          {frozenAisleCount ? null : null}

          {loading ? (
            <Skeleton />
          ) : (
            <h2 className={noir.className}>Other products</h2>
          )}
          <ul
            className="product-list"
            style={{ display: "flex", flexDirection: "row", flexWrap: "wrap" }}
          >
            {responseData &&
              responseData.map(
                (item, index) =>
                  item.aisle === undefined && (
                    <li key={index} tabIndex="-1" className="product-list-item">
                      <div className="product-container">
                        <div className="product-info-container">
                          <div className="product-image-container">
                            {loading ? (
                              <Skeleton width={110} height={110} />
                            ) : (
                              <>
                                <div style={{ height: "35px" }}>
                                  {addedToCartImage[index] ? (
                                    <Image
                                      style={{ paddingLeft: "90px" }}
                                      width={35}
                                      height={35}
                                      src={added}
                                    />
                                  ) : (
                                    " "
                                  )}
                                </div>
                                <Zoom>
                                  <img
                                    alt="skksks"
                                    src={item.image}
                                    //loading="lazy"
                                    className="product-image"
                                    //aria-hidden="true"
                                  />
                                </Zoom>
                              </>
                            )}
                          </div>
                          <div
                            className="price-container"
                            data-testid="price-product-tile"
                          >
                            {loading ? (
                              <Skeleton width={70} height={16} />
                            ) : (
                              <p
                                className={`${noir.className} price-paragraph`}
                                data-testid="price"
                              >
                                ${item.prices.price}
                                {item.prices.wasPrice && (
                                  <s
                                    style={{
                                      marginRight: "10px",
                                      marginBottom: "5px",
                                    }}
                                  >
                                    ({item.prices.wasPrice})
                                  </s>
                                )}
                              </p>
                            )}
                          </div>
                          {/* <a href="lalal" className="link-box-overlay"> */}
                          <div className="overlay-container">
                            {loading ? (
                              <Skeleton width={154} height={12} />
                            ) : (
                              <p
                                className={`${noir.className} product-brand-paragraph`}
                                data-testid="product-brand"
                              >
                                {item.brand}
                              </p>
                            )}
                            {loading ? (
                              <Skeleton width={154} height={12} />
                            ) : (
                              <h3
                                className={`${noir.className} product-title-heading`}
                                data-testid="product-title"
                              >
                                {item.name}
                              </h3>
                            )}
                            {loading ? (
                              <Skeleton width={154} height={12} />
                            ) : (
                              <p
                                className="package-size-paragraph"
                                data-testid="product-package-size"
                              >
                                {item.prices.size == ""
                                  ? "$" +
                                    (item.prices.unitPriceValue * 10).toFixed(
                                      2
                                    ) +
                                    " / 1" +
                                    " " +
                                    "kg"
                                  : item.prices.size}
                              </p>
                            )}
                          </div>
                        </div>
                        {loading ? (
                          <Skeleton />
                        ) : (
                          <button
                            onClick={() => handleAddToCart(item, index)}
                            className={`${noir.className} box`}
                            style={{
                              outline: "0",
                              cursor: "pointer",
                              padding: "5px 16px",
                              fontSize: "14px",
                              fontWeight: "500",
                              lineHeight: "20px",
                              verticalAlign: "middle",
                              border: "1px solid",
                              borderRadius: " 6px",
                              color: " #24292e",
                              backgroundColor: "#fafbfc",
                              borderColor: "#1b1f2326",
                              transition: "0.2s cubic-bezier(0.3, 0, 0.5, 1)",
                            }}
                          >
                            {addedToCart[index]
                              ? "Added to cart"
                              : "Add to Cart"}
                          </button>
                        )}
                      </div>
                    </li>
                  )
              )}
          </ul>

          {loading ? (
            <Skeleton />
          ) : (
            <h2 className={noir.className}>Other products</h2>
          )}
          <ul
            className="product-list"
            style={{ display: "flex", flexDirection: "row", flexWrap: "wrap" }}
          >
            {responseData &&
              responseData.map(
                (item, index) =>
                  item.aisle === "Fruits & Vegetables" && (
                    <li key={index} tabIndex="-1" className="product-list-item">
                      <div className="product-container">
                        <div className="product-info-container">
                          <div className="product-image-container">
                            {loading ? (
                              <Skeleton width={110} height={110} />
                            ) : (
                              <>
                                <div style={{ height: "35px" }}>
                                  {addedToCartImage[index] ? (
                                    <Image
                                      style={{ paddingLeft: "90px" }}
                                      width={35}
                                      height={35}
                                      src={added}
                                    />
                                  ) : (
                                    " "
                                  )}
                                </div>
                                <Zoom>
                                  <img
                                    alt="skksks"
                                    src={item.image}
                                    //loading="lazy"
                                    className="product-image"
                                    //aria-hidden="true"
                                  />
                                </Zoom>
                              </>
                            )}
                          </div>
                          <div
                            className="price-container"
                            data-testid="price-product-tile"
                          >
                            {loading ? (
                              <Skeleton width={70} height={16} />
                            ) : (
                              <p
                                className={`${noir.className} price-paragraph`}
                                data-testid="price"
                              >
                                ${item.prices.price}
                                {item.prices.wasPrice && (
                                  <s
                                    style={{
                                      marginRight: "10px",
                                      marginBottom: "5px",
                                    }}
                                  >
                                    ({item.prices.wasPrice})
                                  </s>
                                )}
                              </p>
                            )}
                          </div>
                          {/* <a href="lalal" className="link-box-overlay"> */}
                          <div className="overlay-container">
                            {loading ? (
                              <Skeleton width={154} height={12} />
                            ) : (
                              <p
                                className={`${noir.className} product-brand-paragraph`}
                                data-testid="product-brand"
                              >
                                {item.brand}
                              </p>
                            )}
                            {loading ? (
                              <Skeleton width={154} height={12} />
                            ) : (
                              <h3
                                className={`${noir.className} product-title-heading`}
                                data-testid="product-title"
                              >
                                {item.name}
                              </h3>
                            )}
                            {loading ? (
                              <Skeleton width={154} height={12} />
                            ) : (
                              <p
                                className="package-size-paragraph"
                                data-testid="product-package-size"
                              >
                                {item.prices.size == ""
                                  ? "$" +
                                    (item.prices.unitPriceValue * 10).toFixed(
                                      2
                                    ) +
                                    " / 1" +
                                    " " +
                                    "kg"
                                  : item.prices.size}
                              </p>
                            )}
                          </div>
                        </div>
                        {loading ? (
                          <Skeleton />
                        ) : (
                          <button
                            onClick={() => handleAddToCart(item, index)}
                            className={`${noir.className} box`}
                            style={{
                              outline: "0",
                              cursor: "pointer",
                              padding: "5px 16px",
                              fontSize: "14px",
                              fontWeight: "500",
                              lineHeight: "20px",
                              verticalAlign: "middle",
                              border: "1px solid",
                              borderRadius: " 6px",
                              color: " #24292e",
                              backgroundColor: "#fafbfc",
                              borderColor: "#1b1f2326",
                              transition: "0.2s cubic-bezier(0.3, 0, 0.5, 1)",
                            }}
                          >
                            {addedToCart[index]
                              ? "Added to cart"
                              : "Add to Cart"}
                          </button>
                        )}
                      </div>
                    </li>
                  )
              )}
          </ul>
        </div>
      )}
    </div>
  );
};

export default Index;
