import classNames from "classnames";

import styles from "@/styles/Show/Show.module.css";
import { AwardDTO, GrantDTO } from "@/types/Show";
import ShowHonorItem from "./ShowHonorItem";

function ShowHonors({
  awards,
  grants,
}: {
  awards: AwardDTO[] | undefined;
  grants: GrantDTO[] | undefined;
}) {
  if (!awards && !grants) {
    return null;
  }

  const safeAwards = awards ?? [];
  const safeGrants = grants ?? [];

  return (
    <section
      className={classNames(
        styles.sectionSeparator,
        styles.showSection,
        styles.showAwardsGrants
      )}
    >
      {safeAwards.length > 0 && (
        <section>
          <h3 className="visuallyHidden">Premios</h3>
          {safeAwards.map((award, i) => (
            <ShowHonorItem key={award.name + i} item={award} />
          ))}
        </section>
      )}
      {safeGrants.length > 0 && (
        <section
          className={classNames({
            [styles.subSectionSeparator]: safeAwards.length > 0,
          })}
        >
          <h3 className="visuallyHidden">Grants</h3>
          {safeGrants.map((grant, i) => (
            <ShowHonorItem key={grant.name + i} item={grant} />
          ))}
        </section>
      )}
    </section>
  );
}

export default ShowHonors;
