import React, { useEffect, useState, useRef } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { PropagateLoader } from "react-spinners";
import toast from "react-hot-toast";
import { FiEdit3, FiImage, FiPackage, FiSave } from "react-icons/fi";
import { get_category } from "../../store/Reducers/categoryReducer";
import {
  get_product,
  messageClear,
  update_product,
  product_image_update,
} from "../../store/Reducers/productReducer";
import JoditEditor from "jodit-react";
import { overrideStyle } from "../../utils/utils";

const EditProduct = () => {
  const editor = useRef(null);
  const [content, setContent] = useState("");
  const navigate = useNavigate();

  const { productId } = useParams();
  const dispatch = useDispatch();
  const { categorys } = useSelector((state) => state.category);
  const { product, loader, errorMessage, successMessage } = useSelector(
    (state) => state.product,
  );
  const isApproved = product?.approval_status === "approved";

  useEffect(() => {
    dispatch(
      get_category({
        searchValue: "",
        parPage: "",
        page: "",
      }),
    );
  }, []);

  const [state, setState] = useState({
    name: "",
    description: "",
    discount: "",
    price: "",
    brand: "",
    stock: "",
  });

  const inputHandle = (e) => {
    setState({
      ...state,
      [e.target.name]: e.target.value,
    });
  };

  useEffect(() => {
    dispatch(get_product(productId));
  }, [productId]);

  const [cateShow, setCateShow] = useState(false);
  const [category, setCategory] = useState("");
  const [allCategory, setAllCategory] = useState([]);
  const [searchValue, setSearchValue] = useState("");

  const categorySearch = (e) => {
    const value = e.target.value;
    setSearchValue(value);
    if (value) {
      const srcValue = allCategory.filter(
        (c) => c.name.toLowerCase().indexOf(value.toLowerCase()) > -1,
      );
      setAllCategory(srcValue);
    } else {
      setAllCategory(categorys);
    }
  };

  const [imageShow, setImageShow] = useState([]);
  const [shouldRedirect, setShouldRedirect] = useState(false);

  const changeImage = (img, files) => {
    if (isApproved) {
      toast.error("Approved product cannot be edited");
      return;
    }
    if (files.length > 0) {
      setShouldRedirect(true);
      dispatch(
        product_image_update({
          oldImage: img,
          newImage: files[0],
          productId,
        }),
      );
    }
  };

  useEffect(() => {
    setState({
      name: product?.name || "",
      description: product?.description || "",
      discount: product?.discount || "",
      price: product?.price || "",
      brand: product?.brand || "",
      stock: product?.stock || "",
    });
    setContent(product?.description || "");
    setCategory(product?.category || "");
    setImageShow(product?.images || []);
  }, [product]);

  useEffect(() => {
    if (categorys.length > 0) {
      setAllCategory(categorys);
    }
  }, [categorys]);

  useEffect(() => {
    let redirectTimer;

    if (errorMessage) {
      toast.error(errorMessage);
      dispatch(messageClear());
      setShouldRedirect(false);
    }
    if (successMessage) {
      toast.success(successMessage);
      dispatch(messageClear());
      if (shouldRedirect) {
        redirectTimer = setTimeout(() => {
          navigate("/seller/dashboard/products");
        }, 800);
      }
    }

    return () => {
      if (redirectTimer) clearTimeout(redirectTimer);
    };
  }, [successMessage, errorMessage, shouldRedirect, dispatch, navigate]);

  const update = (e) => {
    e.preventDefault();
    if (isApproved) {
      toast.error("Approved product cannot be edited");
      return;
    }
    const obj = {
      name: state.name,
      description: content,
      discount: state.discount,
      price: state.price,
      brand: state.brand,
      stock: state.stock,
      productId: productId,
    };
    setShouldRedirect(true);
    dispatch(update_product(obj));
  };

  return (
    <div className="px-2 lg:px-7 pt-5 pb-7">
      <div className="w-full rounded-2xl border border-slate-700 bg-[#283046] p-4 md:p-6">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-[#d0d2d6] text-xl md:text-2xl font-semibold flex items-center gap-2">
              <FiEdit3 />
              Edit Product
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Update product information, pricing and images.
            </p>
          </div>
          <Link
            className="inline-flex items-center justify-center rounded-md bg-blue-500 px-5 py-2 text-white hover:shadow-lg hover:shadow-blue-500/40"
            to="/seller/dashboard/products"
          >
            Back To Products
          </Link>
        </div>

        {isApproved && (
          <div className="mb-5 rounded-lg border border-yellow-500 bg-yellow-500/15 px-4 py-3 text-yellow-200">
            This product is approved and locked. Seller cannot edit it.
          </div>
        )}

        <form onSubmit={update} className="space-y-6">
          <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
            <div className="xl:col-span-8 space-y-6">
              <div className="rounded-xl border border-slate-700 bg-[#1f2d44] p-4 md:p-5">
                <h2 className="mb-4 text-[#d0d2d6] font-medium text-base flex items-center gap-2">
                  <FiPackage />
                  Basic Details
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-[#d0d2d6]">
                  <div className="flex flex-col gap-1">
                    <label htmlFor="name">Product Name</label>
                    <input
                      disabled={isApproved}
                      className="px-4 py-2 focus:border-indigo-500 outline-none bg-[#283046] border border-slate-700 rounded-md text-[#d0d2d6] disabled:opacity-60"
                      onChange={inputHandle}
                      value={state.name}
                      type="text"
                      placeholder="Product name"
                      name="name"
                      id="name"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label htmlFor="brand">Product Brand</label>
                    <input
                      disabled={isApproved}
                      className="px-4 py-2 focus:border-indigo-500 outline-none bg-[#283046] border border-slate-700 rounded-md text-[#d0d2d6] disabled:opacity-60"
                      onChange={inputHandle}
                      value={state.brand}
                      type="text"
                      placeholder="Product brand"
                      name="brand"
                      id="brand"
                    />
                  </div>

                  <div className="flex flex-col gap-1 relative">
                    <label htmlFor="category">Category</label>
                    <input
                      readOnly
                      onClick={() => !isApproved && setCateShow(!cateShow)}
                      className="px-4 py-2 focus:border-indigo-500 outline-none bg-[#283046] border border-slate-700 rounded-md text-[#d0d2d6] disabled:opacity-60"
                      value={category}
                      type="text"
                      placeholder="--select category--"
                      id="category"
                      disabled={isApproved}
                    />

                    <div
                      className={`absolute top-[101%] left-0 z-20 bg-slate-800 w-full rounded-md border border-slate-700 origin-top transition-all ${
                        cateShow ? "scale-100 opacity-100" : "scale-95 opacity-0 pointer-events-none"
                      }`}
                    >
                      <div className="w-full px-3 py-3 border-b border-slate-700">
                        <input
                          disabled={isApproved}
                          value={searchValue}
                          onChange={categorySearch}
                          className="px-3 py-2 w-full focus:border-indigo-500 outline-none bg-transparent border border-slate-700 rounded-md text-[#d0d2d6] disabled:opacity-60"
                          type="text"
                          placeholder="Search category"
                        />
                      </div>
                      <div className="max-h-[220px] overflow-y-auto">
                        {allCategory.length > 0 &&
                          allCategory.map((c) => (
                            <span
                              key={c._id}
                              className={`px-4 py-2 hover:bg-indigo-500 hover:text-white w-full cursor-pointer block ${
                                category === c.name ? "bg-indigo-500 text-white" : ""
                              }`}
                              onClick={() => {
                                setCateShow(false);
                                setCategory(c.name);
                                setSearchValue("");
                                setAllCategory(categorys);
                              }}
                            >
                              {c.name}
                            </span>
                          ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label htmlFor="stock">Stock</label>
                    <input
                      disabled={isApproved}
                      className="px-4 py-2 focus:border-indigo-500 outline-none bg-[#283046] border border-slate-700 rounded-md text-[#d0d2d6] disabled:opacity-60"
                      onChange={inputHandle}
                      value={state.stock}
                      type="number"
                      min="0"
                      placeholder="Product stock"
                      name="stock"
                      id="stock"
                    />
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-slate-700 bg-[#1f2d44] p-4 md:p-5">
                <h2 className="mb-4 text-[#d0d2d6] font-medium text-base">
                  Pricing
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-[#d0d2d6]">
                  <div className="flex flex-col gap-1">
                    <label htmlFor="price">Price</label>
                    <input
                      disabled={isApproved}
                      className="px-4 py-2 focus:border-indigo-500 outline-none bg-[#283046] border border-slate-700 rounded-md text-[#d0d2d6] disabled:opacity-60"
                      onChange={inputHandle}
                      value={state.price}
                      type="number"
                      placeholder="Price"
                      name="price"
                      id="price"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label htmlFor="discount">Discount</label>
                    <input
                      disabled={isApproved}
                      className="px-4 py-2 focus:border-indigo-500 outline-none bg-[#283046] border border-slate-700 rounded-md text-[#d0d2d6] disabled:opacity-60"
                      onChange={inputHandle}
                      value={state.discount}
                      type="number"
                      placeholder="% discount"
                      name="discount"
                      id="discount"
                    />
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-slate-700 bg-[#1f2d44] p-4 md:p-5">
                <h2 className="mb-4 text-[#d0d2d6] font-medium text-base">
                  Description
                </h2>
                <div className="text-[#d0d2d6]">
                  <JoditEditor
                    ref={editor}
                    value={content}
                    tabIndex={1}
                    onBlur={(newContent) => setContent(newContent)}
                    onChange={(newContent) => setContent(newContent)}
                  />
                </div>
              </div>
            </div>

            <div className="xl:col-span-4 space-y-6">
              <div className="rounded-xl border border-slate-700 bg-[#1f2d44] p-4 md:p-5">
                <h2 className="mb-3 text-[#d0d2d6] font-medium text-base">
                  Product Status
                </h2>
                <div className="space-y-2 text-sm text-slate-300">
                  <p>
                    <span className="text-slate-400">Approval:</span>{" "}
                    <span className="capitalize">{product?.approval_status || "pending"}</span>
                  </p>
                  <p>
                    <span className="text-slate-400">Images:</span> {imageShow.length}
                  </p>
                  <p>
                    <span className="text-slate-400">Category:</span>{" "}
                    {category || "N/A"}
                  </p>
                </div>
              </div>

              <div className="rounded-xl border border-slate-700 bg-[#1f2d44] p-4 md:p-5">
                <h2 className="mb-4 text-[#d0d2d6] font-medium text-base flex items-center gap-2">
                  <FiImage />
                  Product Images
                </h2>

                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-2">
                  {imageShow &&
                    imageShow.length > 0 &&
                    imageShow.map((img, i) => (
                      <div key={i} className="rounded-md overflow-hidden border border-slate-700">
                        <label
                          className="h-[120px] block relative cursor-pointer"
                          htmlFor={i.toString()}
                        >
                          <img className="h-full w-full object-cover" src={img} alt="product" />
                          {!isApproved && (
                            <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-all flex items-center justify-center text-xs text-white">
                              Change Image
                            </div>
                          )}
                        </label>
                        <input
                          disabled={isApproved}
                          onChange={(e) => changeImage(img, e.target.files)}
                          type="file"
                          id={i.toString()}
                          className="hidden"
                        />
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-start">
            <button
              disabled={loader || isApproved}
              className="inline-flex items-center justify-center gap-2 bg-blue-500 w-[210px] hover:shadow-blue-500/20 hover:shadow-lg text-white rounded-md px-7 py-2 disabled:opacity-60"
            >
              {loader ? (
                <PropagateLoader color="#fff" cssOverride={overrideStyle} />
              ) : isApproved ? (
                "Product Locked"
              ) : (
                <>
                  <FiSave />
                  Update Product
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProduct;
