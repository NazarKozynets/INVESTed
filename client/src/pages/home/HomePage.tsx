import {SortedIdeas} from "../../components/layout/ideas/SortedIdeas.tsx";

export const HomePage = () => {
    return (
        <section className='home-page'>
            <SortedIdeas seeMoreBtnOnClick={() => window.location.href = "/ideas/all"}/>
        </section>
    )
}