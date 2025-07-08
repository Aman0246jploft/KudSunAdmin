import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useParams } from 'react-router'
import { fetchThreadById } from '../../features/slices/threadSlice'

export default function ThreadDetail() {
    let { id } = useParams()


    const dispatch = useDispatch()
    const selector = useSelector(state => state?.thread?.currentThread)
    console.log("87888888888",selector)

    useEffect(() => {
        if (id) {
            dispatch(fetchThreadById(id))
        }
    }, [id, dispatch])




    return (
        <div>ThreadDetail</div>
    )
}
