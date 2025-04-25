import classNames from "classnames";

import { TechnicalDetailsDTO } from "@/types/Show";

import styles from "@/styles/Show/Show.module.css";

import {
  filterArtistsByRoleType,
  formatNamesWithContext,
  getBasicTechnicalDetails,
  groupArtistsByRole,
} from "@/utils/showUtils";
import ShowTechnicalDetailItem from "./ShowTechnicalItem";

function ShowTechnicalDetails({
  technicalDetails,
}: {
  technicalDetails: TechnicalDetailsDTO;
}) {
  const cast = filterArtistsByRoleType(technicalDetails.artists, "cast");
  const production = filterArtistsByRoleType(
    technicalDetails.artists,
    "production"
  );
  const productionGroupedByRole = groupArtistsByRole(production);
  const basicDetails = getBasicTechnicalDetails(technicalDetails);

  return (
    <section
      className={classNames(
        styles.sectionSeparator,
        styles.showSection,
        styles.showTechnicalDetails
      )}
    >
      <h3 className="visuallyHidden">Ficha técnica</h3>
      {basicDetails.map(({ label, value }) => (
        value === "" ? (
          <br key={label} />
        ) : (
          <ShowTechnicalDetailItem key={label} label={label} value={value} />
        )
      ))}
      
      <ShowTechnicalDetailItem
        label="REPARTO"
        value={formatNamesWithContext(
          cast.map((artist) => ({
            name: artist.name,
            context: artist.context ?? null,
          }))
        )}
      />

      {Object.entries(productionGroupedByRole).map(([role, names]) => (
        <ShowTechnicalDetailItem
          key={role}
          label={role.toUpperCase()}
          value={formatNamesWithContext(names)}
        />
      ))}
    </section>
  );
}

export default ShowTechnicalDetails;
