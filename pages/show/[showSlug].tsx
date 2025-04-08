import { GetServerSideProps } from "next";
import Navbar from "@/components/Navbar";
import { ShowDTO } from "@/types/Show";
import { API_BASE_URL } from "@/utils/constants";
import "../../src/styles/globals.css";

// import Show from "@/components/Show";

interface ShowPageProps {
  showData: ShowDTO;
}

export default function ShowPage({ showData }: ShowPageProps) {
  if (!showData) {
    return <div>Show not found.</div>;
  }

  return (
    <div className="u-container">
      <Navbar />

      {/* <main>
        <Show showData={showData} />
      </main> */}
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { showSlug } = context.params as { showSlug: string };

  const response = await fetch(`${API_BASE_URL}/show/${showSlug}`);
  const showData: ShowDTO = await response.json();

  return {
    props: {
      showData,
    },
  };
};
