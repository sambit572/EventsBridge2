import React from "react";
import { Seo } from "../../seo/seo";

const blogPosts = [
  {
    title: "10 Tips to Plan the Perfect Wedding on a Budget",
    excerpt:
      "Planning a dream wedding doesn't have to break the bank. Here are practical tips to help you save without compromising on the celebration you deserve.",
  },
  {
    title: "How to Choose the Right Photographer for Your Event",
    excerpt:
      "From candid shots to cinematic films, here's what to look for when comparing photographers and videographers on EventsBridge.",
  },
  {
    title: "Decor Trends for Weddings in Odisha This Season",
    excerpt:
      "Explore the latest mandap, floral and lighting trends that are taking over Odisha weddings this year.",
  },
];

const Blog = () => {
  return (
    <>
      <Seo
        title="EventsBridge Blog | Wedding Planning Tips, Event Ideas, Vendor Guides & Latest Trends"
        description="Explore expert wedding planning tips, event inspiration, decoration ideas, budgeting guides, photography advice, venue recommendations and local vendor insights to plan your perfect celebration with EventsBridge."
      />
      <div className="bg-[#fefcff] min-h-screen py-12 px-4 md:px-20">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-[#001f3f]">
              EventsBridge Blog
            </h1>
            <p className="text-[#001f3f] mt-3 text-lg">
              Wedding planning tips, event ideas and vendor guides to help
              you plan your perfect celebration.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {blogPosts.map((post, index) => (
              <div
                key={index}
                className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition"
              >
                <h2 className="text-xl font-semibold text-[#001f3f] mb-2">
                  {post.title}
                </h2>
                <p className="text-gray-600">{post.excerpt}</p>
              </div>
            ))}
          </div>

          <div className="text-center mt-12 text-gray-500">
            More articles coming soon.
          </div>
        </div>
      </div>
    </>
  );
};

export default Blog;