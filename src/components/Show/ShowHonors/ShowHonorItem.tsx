import { AwardDTO, GrantDTO } from '@/types/Show';

function ShowHonorItem({
    item,
  }: {
    item: AwardDTO | GrantDTO;
  }) {
    return (
      <article>
        <header>
          <h4 className="fontPrimaryBold">
            {item.name}, {item.year}
          </h4>
        </header>
        <p className="fontPrimary">{item.organization}</p>
        <p className="fontPrimaryItalic">
          {item.context ? item.context : item.description}
        </p>
      </article>
    );
  }

export default ShowHonorItem
