import React, { useEffect, useState } from "react";
import { FaCloudUploadAlt, FaTrash } from "react-icons/fa";
import { PropagateLoader } from "react-spinners";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import {
  add_banner,
  delete_banner,
  get_admin_banners,
  messageClear,
} from "../../store/Reducers/bannerReducer";
import { overrideStyle } from "../../utils/utils";

const Banners = () => {
  const dispatch = useDispatch();
  const { banners, loader, successMessage, errorMessage } = useSelector(
    (state) => state.banner,
  );

  const [image, setImage] = useState("");
  const [imageShow, setImageShow] = useState("");
  const [link, setLink] = useState("");

  const imageHandle = (e) => {
    const files = e.target.files;
    if (files.length > 0) {
      setImage(files[0]);
      setImageShow(URL.createObjectURL(files[0]));
    }
  };

  const submit = (e) => {
    e.preventDefault();
    if (!image) {
      toast.error("Please select banner image");
      return;
    }

    const formData = new FormData();
    formData.append("image", image);
    if (link.trim()) {
      formData.append("link", link.trim());
    }

    dispatch(add_banner(formData));
  };

  const deleteHandler = (bannerId) => {
    if (window.confirm("Delete this banner?")) {
      dispatch(delete_banner(bannerId));
    }
  };

  useEffect(() => {
    dispatch(get_admin_banners());
  }, [dispatch]);

  useEffect(() => {
    if (errorMessage) {
      toast.error(errorMessage);
      dispatch(messageClear());
    }
    if (successMessage) {
      toast.success(successMessage);
      dispatch(messageClear());
      setImage("");
      setImageShow("");
      setLink("");
      dispatch(get_admin_banners());
    }
  }, [successMessage, errorMessage, dispatch]);

  return (
    <div className="px-2 lg:px-7 pt-5">
      <div className="w-full p-4 bg-[#283046] rounded-md">
        <h1 className="text-[#d0d2d6] text-xl font-semibold mb-4">
          Banner Section
        </h1>

        <form onSubmit={submit} className="mb-8 border border-slate-700 p-4 rounded-md">
          <h2 className="text-[#d0d2d6] text-lg font-medium mb-4">Add Banner</h2>

          <div className="mb-4">
            <label
              className="flex justify-center items-center flex-col h-[180px] cursor-pointer border border-dashed hover:border-indigo-500 w-full text-[#d0d2d6]"
              htmlFor="banner-image"
            >
              <span className="text-4xl">
                <FaCloudUploadAlt />
              </span>
              <span>Select banner image</span>
            </label>
            <input
              required
              onChange={imageHandle}
              className="hidden"
              type="file"
              id="banner-image"
            />
          </div>

          {imageShow && (
            <div className="mb-4">
              <img className="w-full max-h-[260px] object-cover rounded-md" src={imageShow} alt="preview" />
            </div>
          )}

          <div className="mb-4">
            <label className="text-[#d0d2d6] text-sm mb-1 block">
              Banner Link (optional)
            </label>
            <input
              value={link}
              onChange={(e) => setLink(e.target.value)}
              type="text"
              placeholder="example: product-slug or /shop"
              className="w-full px-4 py-2 focus:border-indigo-500 outline-none bg-[#283046] border border-slate-700 rounded-md text-[#d0d2d6]"
            />
          </div>

          <button
            disabled={loader}
            className="bg-blue-500 w-[190px] hover:shadow-blue-500/20 hover:shadow-lg text-white rounded-md px-7 py-2"
          >
            {loader ? (
              <PropagateLoader color="#fff" cssOverride={overrideStyle} />
            ) : (
              "Add Banner"
            )}
          </button>
        </form>

        <div className="border border-slate-700 p-4 rounded-md">
          <h2 className="text-[#d0d2d6] text-lg font-medium mb-4">Banner List</h2>

          <div className="relative overflow-x-auto">
            <table className="w-full text-sm text-left text-[#d0d2d6]">
              <thead className="text-sm text-[#d0d2d6] uppercase border-b border-slate-700">
                <tr>
                  <th className="py-3 px-4">No</th>
                  <th className="py-3 px-4">Banner</th>
                  <th className="py-3 px-4">Link</th>
                  <th className="py-3 px-4">Action</th>
                </tr>
              </thead>
              <tbody>
                {banners.map((banner, i) => (
                  <tr key={banner._id} className="border-b border-slate-700">
                    <td className="py-3 px-4">{i + 1}</td>
                    <td className="py-3 px-4">
                      <img
                        className="w-[110px] h-[52px] object-cover rounded"
                        src={banner.banner}
                        alt="banner"
                      />
                    </td>
                    <td className="py-3 px-4">
                      {banner.link || <span className="text-slate-400">-</span>}
                    </td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => deleteHandler(banner._id)}
                        className="p-[6px] bg-red-500 rounded hover:shadow-lg hover:shadow-red-500/50"
                        title="Delete banner"
                      >
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                ))}
                {!banners.length && (
                  <tr>
                    <td colSpan={4} className="py-6 text-center text-slate-400">
                      No banners found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Banners;
